let pacmans = [];
let stars = [];
const pacmanColors = ['#48cae4', '#90e0ef', '#03045e', '#0077b6', '#caf0f8', '#ade8f4'];

function setup() {
  createCanvas(windowWidth, windowHeight);
  
  // 產生背景星星粒子
  for (let i = 0; i < 150; i++) {
    stars.push(new Star());
  }
  
  // 產生小精靈(吃豆人)粒子
  for (let i = 0; i < 25; i++) {
    pacmans.push(new Pacman());
  }
}

function draw() {
  background(0); // 黑色背景
  
  // 更新與顯示星星
  for (let star of stars) {
    star.update();
    star.display();
  }
  
  // 更新與顯示小精靈
  for (let p of pacmans) {
    p.update();
    p.display();
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

// --- 星星類別 ---
class Star {
  constructor() {
    this.x = random(width);
    this.y = random(height);
    this.r = random(1, 4); // 亂數大小
    this.vx = random(-1, 1); // 亂數速度
    this.vy = random(-1, 1);
    // 亂數顏色
    this.color = color(random(150, 255), random(150, 255), random(150, 255), random(150, 255));
  }
  
  update() {
    this.x += this.vx;
    this.y += this.vy;
    
    // 超出螢幕時從另一側出現
    if (this.x < 0) this.x = width;
    if (this.x > width) this.x = 0;
    if (this.y < 0) this.y = height;
    if (this.y > height) this.y = 0;
  }
  
  display() {
    noStroke();
    fill(this.color);
    circle(this.x, this.y, this.r * 2);
  }
}

// --- 吃豆人(小精靈)類別 ---
class Pacman {
  constructor() {
    this.r = random(20, 45); // 亂數大小
    this.x = random(this.r, width - this.r);
    this.y = random(this.r, height - this.r);
    this.vx = random(-3, 3);
    this.vy = random(-3, 3);
    
    // 確保不會完全靜止
    if (this.vx === 0) this.vx = 1;
    if (this.vy === 0) this.vy = 1;
    
    this.color = random(pacmanColors); // 從指定色系中挑選顏色
    
    this.mouthAngle = 0;
    this.mouthDir = 1; // 控制嘴巴開合方向
  }

  update() {
    let d = dist(mouseX, mouseY, this.x, this.y);
    
    if (d < 150) {
      // 滑鼠靠近，往反方向躲開 (驚嚇狀態)
      let angle = atan2(this.y - mouseY, this.x - mouseX);
      this.vx = cos(angle) * 7; 
      this.vy = sin(angle) * 7;
    } else {
      // 一般狀態，讓速度慢慢回穩
      let speed = dist(0, 0, this.vx, this.vy);
      if (speed > 3) {
        this.vx *= 0.95;
        this.vy *= 0.95;
      }
    }
    
    this.x += this.vx;
    this.y += this.vy;
    
    // 邊界碰撞反彈
    if (this.x < this.r) { this.x = this.r; this.vx *= -1; }
    if (this.x > width - this.r) { this.x = width - this.r; this.vx *= -1; }
    if (this.y < this.r) { this.y = this.r; this.vy *= -1; }
    if (this.y > height - this.r) { this.y = height - this.r; this.vy *= -1; }
    
    // 嘴巴動畫更新
    this.mouthAngle += 0.08 * this.mouthDir;
    if (this.mouthAngle > PI / 4 || this.mouthAngle < 0) {
      this.mouthDir *= -1;
    }
  }

  display() {
    let d = dist(mouseX, mouseY, this.x, this.y);
    let moveAngle = atan2(this.vy, this.vx); // 移動面向角度
    let lookAngle = atan2(mouseY - this.y, mouseX - this.x); // 看向滑鼠的角度

    push();
    translate(this.x, this.y);
    rotate(moveAngle); // 讓身體朝向移動方向
    
    noStroke();
    fill(this.color);

    let isSurprised = d < 150;
    let eyeX = 0;
    let eyeY = -this.r * 0.5;
    let eyeSize = isSurprised ? this.r * 0.7 : this.r * 0.4; // 驚嚇時眼睛放大
    
    if (isSurprised) {
      circle(0, 0, this.r * 2); // 驚嚇：完整圓形身體
      fill(0);
      circle(this.r * 0.5, 0, this.r * 0.4); // 驚嚇：圓形「O」字嘴巴
    } else {
      arc(0, 0, this.r * 2, this.r * 2, this.mouthAngle, TWO_PI - this.mouthAngle, PIE); // 一般：缺角笑臉嘴巴
    }
    
    fill(255); circle(eyeX, eyeY, eyeSize); // 畫白眼白
    fill(0); // 畫黑眼球
    let pupilSize = isSurprised ? this.r * 0.35 : this.r * 0.2; // 黑眼球跟著放大
    let pupilOffset = eyeSize / 2 - pupilSize / 2;
    let relativeLook = lookAngle - moveAngle; // 眼球轉動扣掉身體旋轉角度
    circle(eyeX + pupilOffset * cos(relativeLook), eyeY + pupilOffset * sin(relativeLook), pupilSize);
    
    pop();
  }
}
