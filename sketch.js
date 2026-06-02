let pacmans = [];
let stars = [];
const pacmanColors = ['#48cae4', '#90e0ef', '#03045e', '#0077b6', '#caf0f8', '#ade8f4'];
let lastSpawnTime = 0; // 紀錄上一次產生小精靈的時間

function setup() {
  createCanvas(windowWidth, windowHeight);
  
  // 產生背景星星粒子
  for (let i = 0; i < 150; i++) {
    stars.push(new Star());
  }
  
  // 產生小精靈(吃豆人)粒子
  for (let i = 0; i < 20; i++) {
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
  
  // 每 3 秒鐘 (3000 毫秒) 產生一個新的小精靈
  if (millis() - lastSpawnTime > 3000) {
    pacmans.push(new Pacman());
    lastSpawnTime = millis();
  }
  
  // 小精靈互相碰撞與反彈偵測
  for (let i = 0; i < pacmans.length; i++) {
    for (let j = i + 1; j < pacmans.length; j++) {
      pacmans[i].collide(pacmans[j]);
    }
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
    this.history = []; // 紀錄歷史位置，用於脫影效果
  }

  // 處理與其他小精靈的碰撞
  collide(other) {
    let dx = other.x - this.x;
    let dy = other.y - this.y;
    let distance = dist(this.x, this.y, other.x, other.y);
    let minDist = this.r + other.r;

    // 如果距離小於兩者半徑之和，代表發生碰撞
    if (distance < minDist && distance > 0) {
      // 1. 分離重疊的物件，避免黏在一起
      let overlap = minDist - distance;
      let nx = dx / distance;
      let ny = dy / distance;
      
      this.x -= nx * overlap * 0.5;
      this.y -= ny * overlap * 0.5;
      other.x += nx * overlap * 0.5;
      other.y += ny * overlap * 0.5;

      // 2. 彈性碰撞速度計算 (以半徑當作質量)
      let kx = this.vx - other.vx;
      let ky = this.vy - other.vy;
      let p = 2 * (nx * kx + ny * ky) / (this.r + other.r);
      
      this.vx -= p * other.r * nx;
      this.vy -= p * other.r * ny;
      other.vx += p * this.r * nx;
      other.vy += p * this.r * ny;
    }
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

    // 紀錄軌跡位置
    this.history.push({ x: this.x, y: this.y, moveAngle: atan2(this.vy, this.vx) });
    if (this.history.length > 7) { // 保持軌跡長度 (保留7個影格)，數字越大殘影越長
      this.history.shift(); // 移除最舊的軌跡
    }
  }

  display() {
    let d = dist(mouseX, mouseY, this.x, this.y);
    let moveAngle = atan2(this.vy, this.vx); // 移動面向角度
    let lookAngle = atan2(mouseY - this.y, mouseX - this.x); // 看向滑鼠的角度
    let isSurprised = d < 150;

    // --- 繪製脫影 (殘影) ---
    if (isSurprised) {
      for (let i = 0; i < this.history.length; i++) {
        let pos = this.history[i];
        let alpha = map(i, 0, this.history.length, 0, 100); // 越舊的殘影越透明
        push();
        translate(pos.x, pos.y);
        rotate(pos.moveAngle);
        let c = color(this.color);
        c.setAlpha(alpha); // 設定殘影透明度
        fill(c);
        noStroke();
        circle(0, 0, this.r * 2);
        pop();
      }
    }

    push();
    translate(this.x, this.y);
    rotate(moveAngle); // 讓身體朝向移動方向
    
    // --- 繪製速度線 (類似風的效果) ---
    if (isSurprised) {
      stroke(255, 150); // 白色且半透明的線條
      strokeWeight(2);
      strokeCap(ROUND); // 線條兩端圓角
      // 在物件後方 (因為已經 rotate 所以是 -x 方向) 畫出三條白色風切線
      line(-this.r * 1.2, -this.r * 0.4, -this.r * 2.5, -this.r * 0.4);
      line(-this.r * 1.5, 0, -this.r * 3.2, 0);
      line(-this.r * 1.1, this.r * 0.4, -this.r * 2.2, this.r * 0.4);
    }

    noStroke();
    fill(this.color);

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
