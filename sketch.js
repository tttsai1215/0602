let pacmans = [];
let stars = [];
let particles = []; // 儲存爆炸粒子
let floatingTexts = []; // 儲存飄浮文字
const pacmanColors = ['#48cae4', '#90e0ef', '#03045e', '#0077b6', '#caf0f8', '#ade8f4'];
let lastSpawnTime = 0; // 紀錄上一次產生小精靈的時間
let score = 0; // 遊戲分數
let maxPacmans = 35; // 限制最大數量避免卡頓

function setup() {
  createCanvas(windowWidth, windowHeight);
  noCursor(); // 隱藏預設游標，改用自訂的遊戲準星
  
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
  if (millis() - lastSpawnTime > 3000 && pacmans.length < maxPacmans) {
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
  
  // 更新與顯示爆炸粒子
  for (let i = particles.length - 1; i >= 0; i--) {
    particles[i].update();
    particles[i].display();
    if (particles[i].alpha <= 0) particles.splice(i, 1);
  }

  // 更新與顯示飄浮文字
  for (let i = floatingTexts.length - 1; i >= 0; i--) {
    floatingTexts[i].update();
    floatingTexts[i].display();
    if (floatingTexts[i].alpha <= 0) floatingTexts.splice(i, 1);
  }
  
  // --- 繪製遊戲 UI (計分板) ---
  push();
  drawingContext.shadowBlur = 4;
  drawingContext.shadowColor = 'black'; // 替文字加上黑色陰影增加辨識度
  drawingContext.shadowOffsetX = 2;
  drawingContext.shadowOffsetY = 2;
  textSize(24);
  textAlign(LEFT, TOP);
  textStyle(BOLD);
  noStroke();
  fill(255);
  text(`SCORE: ${score}`, 20, 20);
  text(`PACMANS: ${pacmans.length} / ${maxPacmans}`, 20, 50);
  pop();

  // --- 繪製自訂游標 (獵人準星) ---
  stroke(255, 100);
  strokeWeight(2);
  noFill();
  circle(mouseX, mouseY, 30);
  fill(255, 150);
  noStroke();
  circle(mouseX, mouseY, 6);
}

function mousePressed() {
  // 點擊抓捕小精靈 (從陣列後面往前找，確保點到最上層的物件)
  for (let i = pacmans.length - 1; i >= 0; i--) {
    let p = pacmans[i];
    if (dist(mouseX, mouseY, p.x, p.y) < p.r) {
      // 產生爆炸粒子特效
      for (let j = 0; j < 20; j++) {
        particles.push(new Particle(p.x, p.y, p.color));
      }
      // 產生飄浮加分文字
      floatingTexts.push(new FloatingText(p.x, p.y, "+10"));
      
      pacmans.splice(i, 1); // 移除小精靈
      score += 10; // 獲得分數
      break; // 每次點擊只抓一隻，避免一擊多殺
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

// --- 爆炸粒子類別 ---
class Particle {
  constructor(x, y, c) {
    this.x = x;
    this.y = y;
    this.vx = random(-6, 6);
    this.vy = random(-6, 6);
    // 混入白色與亮色系，解決深色粒子在黑背景看不清楚的問題
    this.color = random([c, '#ffffff', '#ffea00', '#00e5ff']);
    this.alpha = 255; // 初始不透明
    this.r = random(2, 6); // 粒子大小
  }
  
  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.alpha -= 8; // 逐漸變透明消散
  }
  
  display() {
    noStroke();
    let col = color(this.color);
    col.setAlpha(this.alpha);
    fill(col);
    
    // 加上發光效果，讓爆破看起來更有張力
    drawingContext.shadowBlur = 15;
    drawingContext.shadowColor = this.color;
    
    circle(this.x, this.y, this.r * 2);
    drawingContext.shadowBlur = 0; // 畫完重置陰影
  }
}

// --- 飄浮文字類別 ---
class FloatingText {
  constructor(x, y, txt) {
    this.x = x;
    this.y = y;
    this.txt = txt;
    this.alpha = 255;
    this.vy = -2; // 往上飄移的速度
  }
  update() {
    this.y += this.vy;
    this.alpha -= 5; // 逐漸消失
  }
  display() {
    fill(255, 255, 0, this.alpha); // 黃色文字搭配透明度
    noStroke();
    textSize(28);
    textAlign(CENTER, CENTER);
    textStyle(BOLD);
    text(this.txt, this.x, this.y);
  }
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
    this.alphaOffset = random(TWO_PI); // 用於閃爍動畫的時間差
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
    let currentAlpha = 150 + sin(frameCount * 0.05 + this.alphaOffset) * 105; // 星星呼吸閃爍效果
    noStroke();
    let c = color(this.color);
    c.setAlpha(currentAlpha);
    fill(c);
    drawingContext.shadowBlur = 8; // 星星發光效果
    drawingContext.shadowColor = this.color;
    circle(this.x, this.y, this.r * 2);
    drawingContext.shadowBlur = 0; // 畫完重置陰影
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
    
    // 小精靈沿路吃星星機制
    for (let i = stars.length - 1; i >= 0; i--) {
      let dStar = dist(this.x, this.y, stars[i].x, stars[i].y);
      if (dStar < this.r) {
        stars.splice(i, 1); // 刪除被吃掉的星星
        stars.push(new Star()); // 隨機位置補充一顆新星星
        this.r = min(this.r + 0.5, 60); // 吃星星會稍微變大，但限制最大半徑避免過肥
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
    
    // 替小精靈加上霓虹發光效果 (驚嚇時發光更強)
    drawingContext.shadowBlur = isSurprised ? 30 : 15;
    drawingContext.shadowColor = this.color;

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
    
    drawingContext.shadowBlur = 0; // 重置發光，避免眼睛跟眼球也一起發光糊掉
    
    fill(255); circle(eyeX, eyeY, eyeSize); // 畫白眼白
    fill(0); // 畫黑眼球
    let pupilSize = isSurprised ? this.r * 0.35 : this.r * 0.2; // 黑眼球跟著放大
    let pupilOffset = eyeSize / 2 - pupilSize / 2;
    let relativeLook = lookAngle - moveAngle; // 眼球轉動扣掉身體旋轉角度
    circle(eyeX + pupilOffset * cos(relativeLook), eyeY + pupilOffset * sin(relativeLook), pupilSize);
    
    pop();
  }
}
