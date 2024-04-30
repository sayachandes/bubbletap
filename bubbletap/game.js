//ゲームインスタンス
let game;

//ロード時の処理
window.onload = function(){
    //ゲーム設定
    let gameconfig = {
        type:Phaser.AUTO,
        width:1080,
        height:1921,
        scene:[Title,Explanation,Playgame,Result,Ranking],
        backgroundColor:0x000000,
    }
    //ゲームインスタンス生成
    game = new Phaser.Game(gameconfig);
    //ウィンドウフォーカス
    window.focus();
    //リサイズ
    resize();
    //ウィンドウサイズが変わった時にリサイズ
    window.addEventListener("resize",resize,false);    
}




//Tytle
class Title extends Phaser.Scene{
    //コンストラクタ
    constructor(){
        super({key:"Title"});
    }

    preload(){
        //背景画像
        this.load.image("tytlebackground","./material/1.png");
        //ロゴ
        this.load.image("logo","./material/asset/logo.png");
        //bgm
        this.load.audio("bgm","./material/BGM.m4a");
        //start時のSE
        this.load.audio("Start2","./material/Start2.m4a");
    }

    create(){
        //BGMを再生
        this.bgm = this.sound.add("bgm",{loop:true});
        this.bgm.play();

        //タイトル画面とロゴの表示
        let background = this.add.image(this.cameras.main.width/2,this.cameras.main.height/2,"tytlebackground");
        background.setScale(0.34);

        let logo = this.add.image(450,725, "logo");
        logo.setScale(0.5);

  
        //視覚化してstartボタンの場所を確認
        /*let graphics = this.add.graphics();
        graphics.fillStyle(0xFF0000,0.5);
        graphics.fillRect(440,1110,185,50);//1,2を起点に3,4の範囲*/
        //startボタンで次のシーンへ
        this.input.on("pointerdown", (pointer) => {
            if (pointer.x >= 440 && pointer.x <= 625 && pointer.y >= 1110 && pointer.y <= 1160) {
                //SE再生
                this.startSE = this.sound.add("Start2");
                this.startSE.play();
                // 次のシーンに移動
                this.scene.start("Explanation");
            }
        });
    }
}

class Explanation extends Phaser.Scene{
        //コンストラクタ
        constructor(){
            super({key:"Explanation"});
        }
    preload(){
        //背景画像
        this.load.image("explanationbackground","./material/2.png");
    }
    create(){
        //背景画像（説明画像）追加
        let background = this.add.image(this.cameras.main.width/2,this.cameras.main.height/2,"explanationbackground");
        background.setScale(0.34);

        /*this.add.text(400,771,"あたりのバブル",{fontFamily:"HWT Artz W00 Regular", fontSize: "20px", fill: "#ffffff"});
        this.add.text(565,847,"あたり",{fontFamily:"HWT Artz W00 Regular",fontSize:"22px",fill:"#000000"});
        this.add.text(565,925,"はずれ",{fontFamily:"HWT Artz W00 Regular",fontSize:"22px",fill:"#000000"});*/
        //指定されたフォントを使用してテキストを追加できましたが、うまく位置や大きさを指定できませんでした。すこしずれてしまっています。
        //資料を見ると必要ないようにも思えたので、コメントにしてあります。

        //視覚化してstartボタンの場所を確認
        /*let graphics = this.add.graphics();
        graphics.fillStyle(0xFF0000,0.5);
        graphics.fillRect(500,1100,80,80);//1,2を起点に3,4の範囲*/
        //OKボタンで次のシーンへ
        this.input.on('pointerdown', (pointer) => {
            if (pointer.x >= 500 && pointer.x <= 580 && pointer.y >= 1100 && pointer.y <= 1180) {
                //SE再生
                this.startSE = this.sound.add("Start2");
                this.startSE.play();
                // 次のシーンに移動
                this.scene.start("Playgame");
            }
        });
    }
}

class Playgame extends Phaser.Scene{
        //コンストラクタ
        constructor(){
            super({key:"Playgame"});
            this.score = 0;
        }
    preload(){
        //背景画像
        this.load.image("Playgamebackground","./material/3.png");
        //泡と割れた時の画像
        this.load.image("bubble1","./material/asset/bubble1.png");
        this.load.image("bubble1_","./material/asset/bubble1_.png");
        this.load.image("bubble2","./material/asset/bubble2.png");
        this.load.image("bubble3","./material/asset/bubble3.png");
        this.load.image("bubble4","./material/asset/bubble4.png");
        //SE
        this.load.audio("OK","./material/OK_.m4a");
        this.load.audio("NG","./material/NG_.m4a");
    }
    create(){
        //背景画像追加
        let background = this.add.image(this.cameras.main.width/2,this.cameras.main.height/2,"Playgamebackground");
        background.setScale(0.34);

        //装飾の泡を追加
        let bubbleA = this.add.image(400,850,"bubble3");
        bubbleA.setScale(0.4);

        let bubbleB = this.add.image(670,1150,"bubble4");
        bubbleB.setScale(0.4);

        let bubbleC = this.add.image(670,800,"bubble4");
        bubbleC.setScale(-0.3);

        //残り時間とタイマーのテキスト追加
        this.timerText = this.add.text(420,645, "30.0", { fontFamily:"HWT Artz W00 Regular",fontSize:"50px",fill:"#000000"});
        this.scoreText = this.add.text(630,645, "0", { fontFamily:"HWT Artz W00 Regular",fontSize:"50px",fill:"#000000"});

        //フォントをダウンロードした素材から読み込む方法がわからず、onlineWebFontsで同じフォントを見つけて使用しました。

        //タイマーセット
        this.timer = this.time.delayedCall(30000,this.timerFinished,[],this);
        //タイムが0になっても引数は渡さないため、空白

        //泡生成（あたり）
        const generateImage = () => {
            
            let imageClicked = false;

            // ランダムなx座標を決定
            let x = Phaser.Math.Between(430, 660);

            // y座標を固定
            let y = 1500;

            //ランダムなスケールを決定
            let scale = Phaser.Math.FloatBetween(0.1,0.3);
    
            // 画像を生成してスケール適用
            let image = this.add.image(x, y,"bubble1");
            image.setScale(scale);
    
            // Tweenアニメーションを作成して、画像を上に移動させる
            let tween = this.tweens.add({
                targets: image,
                y:750, // 上方向の目標y座標
                duration:3000, // アニメーションの時間（ミリ秒）
                ease:"Linear", // イージング関数（この場合は等速）
                onComplete: () => {
                    // 画面上部まで動いた後
                    if(!imageClicked){
                        image.destroy();
                    }
                }
            });
    
            // 次の画像生成を一定の間隔で行う
            setTimeout(generateImage, 800); // 0.8秒ごとに繰り返し

            //画像がクリックされた際の処理
            image.setInteractive();
            image.on("pointerdown",() =>{
                //画像がクリックされた
                if(!imageClicked){
                imageClicked = true;
                //何回でもクリック→得点を防ぐためのif文
                
                //正解のSE
                this.OKSE = this.sound.add("OK");
                this.OKSE.play();
                //割れた画像に変更し、スコアを表示
                image.setTexture("bubble2");
                //標準時は10点
                let scoreToAdd = 10;
                //10秒を切ったら20点
                if (Math.max(this.timer.getRemainingSeconds(), 0) <= 10){
                    scoreToAdd = 20;
                }

                let text = this.add.text(image.x-(scale*50),image.y,`+${scoreToAdd}`,{ fontFamily:"HWT Artz W00 Regular",fontSize:"140px",fill:"#ff00ff"});
                text.setOrigin(0.5);
                text.setScale(scale);

                //スコア増加
                this.score += scoreToAdd;

                //スコア更新
                this.scoreText.setText(this.score);
                
                //アニメーション停止
                tween.stop();
                //画像がクリックされた→一秒後に画像と点数を削除
                this.time.delayedCall(1000,() =>{
                    if(imageClicked){
                        image.destroy();
                        text.destroy();
                    }
                })
            }
            });
            
        }
    
        // 最初の画像生成をスケジュール
        generateImage();
        
        //泡生成（はずれ）
        const generateIncorrectImage = () => {
            //画像がクリックされたか
            let imageClicked = false;
            // ランダムなx座標を決定
            let x = Phaser.Math.Between(430, 660);
        
            // y座標を固定
            let y = 1500;
        
            //ランダムなスケールを決定
            let scale = Phaser.Math.FloatBetween(0.1, 0.3);
        
            // 不正解の画像を生成してスケール適用
            let image = this.add.image(x, y, "bubble1");
            image.setScale(scale);
        
            // Tweenアニメーションを作成して、画像を上に移動させる
            let tween = this.tweens.add({
                targets: image,
                y: 750, // 上方向の目標y座標
                duration: 3000, // アニメーションの時間（ミリ秒）
                ease: "Linear", // イージング関数（この場合は等速）
                onComplete: () => {
                    // 画面上部まで動いた後消える
                    if(!imageClicked){
                        image.destroy();
                    }
                }
            });

            // 次の画像生成を一定の間隔で行う
            setTimeout(generateIncorrectImage, 1000); // 1秒ごとに繰り返し
        
            //画像がクリックされた際の処理
            image.setInteractive();
            image.on("pointerdown", () => {
                //画像がクリックされた
                if(!imageClicked){
                imageClicked = true;
                //何回でもクリック→得点を防ぐためのif文

                //不正解のSE
                this.NGSE = this.sound.add("NG");
                this.NGSE.play();

                //割れた画像に変更し、スコアを表示
                image.setTexture("bubble2");
                let text = this.add.text(image.x-(scale*50),image.y,"-10",{ fontFamily:"HWT Artz W00 Regular",fontSize:"140px",fill:"#00FFFF"});
                text.setOrigin(0.5);
                text.setScale(scale);

                //スコア減少
                this.score -= 10;

                //スコア更新
                this.scoreText.setText(this.score);
                
                //アニメーション停止
                tween.stop();
                //画像がクリックされた→一秒後に画像と点数を削除
                this.time.delayedCall(1000,() =>{
                    if(imageClicked){
                        image.destroy();
                        text.destroy();
                    }
                })
            }
            });
        
        };
            // 最初の画像生成をスケジュール（はずれ）1秒遅れ
            setTimeout(() => {
                generateIncorrectImage();
            }, 1000);


    }
     // スコアを保存する関数
    saveScore() {
        const latestKey = localStorage.getItem("latestKey"); // 最新のキーを取得
        let latestNumber = parseInt(latestKey) || 0; // 最新のキーを番号に変換。初めて保存する場合は0になる。
    
        const key = `${latestNumber + 1}`; // 番号を1つ増やして新しいキーを生成
    
        localStorage.setItem(key, this.score); // スコアを保存
        localStorage.setItem("latestKey", key); // 最新のキーを更新
    }
//あたりとはずれを一緒に定義して、ランダムで当たりはずれを決めたかったのですができなかったので、あたりとはずれを別々で定義しました。

    update(){
        //残り時間更新
        let remainingTime = Math.max(this.timer.getRemainingSeconds(),0).toFixed(1);
        this.timerText.setText(remainingTime);
    }

    timerFinished(){
        //時間切れになったらローカルストレージにスコアを保存しリザルト画面へ
        this.saveScore(this.score);
        this.scene.start("Result");
    }
    
}

class Result extends Phaser.Scene{
        //コンストラクタ
        constructor(){
            super({key:"Result"});
        }
    preload(){
         //背景画像
         this.load.image("Resultbackground","./material/4.png");
         
    }
    create(){
        //背景画像追加
        let background = this.add.image(this.cameras.main.width/2,this.cameras.main.height/2,"Resultbackground");
        background.setScale(0.34);

        // 最新のスコアを取得する関数
        this.getLatestScore();
        
        //クリックで次のシーンへ
        this.input.on("pointerdown",() =>{
            this.scene.start("Ranking");
        })
   
    }
    getLatestScore() {
        const latestKey = localStorage.getItem("latestKey"); // 最新のキーを取得
        if (!latestKey) {
         return null; // 最新のキーが存在しない場合はnullを返す
       }
       //最新のキーをたどってローカルストレージの中から最新のスコアを呼び出す
       const latestScore = localStorage.getItem(latestKey);
       //結果の表示
       const text=this.add.text(510,750,`${latestScore}`,{ fontFamily:"HWT Artz W00 Regular",fontSize:"80px",fill:"#ff00ff"});
       }



}


class Ranking extends Phaser.Scene{
        //コンストラクタ
        constructor(){
            super({key:"Ranking"});
        }
    preload(){
        //背景画像
        this.load.image("Rankingbackground","./material/5.png");
    }
    create(){
        //背景画像追加
        let background = this.add.image(this.cameras.main.width/2,this.cameras.main.height/2,"Rankingbackground");
        background.setScale(0.34);

        //スコア取得関数
        const rankingData = this.getTop10Scores();
        //スコア表示関数
        this.displayRanking(rankingData);

        this.input.on("pointerdown",() =>{
            this.scene.start("Title");
        })
    }
    //トップ10のスコアを取得する
    getTop10Scores(){
        const allScores = [];
        for (let i =0; i <= localStorage.length; i++){
            const key = localStorage.key(i);
            const score =localStorage.getItem(key);

            if(!isNaN(score)){
                allScores.push({key,score:parseInt(score)});
            }
            //すべてのスコアを取得        
        }

        allScores.sort((a,b) =>b.score-a.score);
        //b-aが正ならbを後ろに配置していく

        const top10Scores = allScores.slice(0,10);
        //並べ替えてトップ10を取得、値を返す
        return top10Scores;
    }
    displayRanking(rankingData) {
        const positions = [
            { x: 430, y: 860 }, // 一位の座標
            { x: 520, y: 860 }, // 二位の座標
            { x: 610, y: 860 }, // 三位の座標
            { x: 550, y: 930 }, // 四位の座標
            { x: 550, y: 975 }, // 五位の座標
            { x: 550, y: 1015 }, // 六位の座標
            { x: 550, y: 1055 }, // 七位の座標
            { x: 550, y: 1095 }, // 八位の座標
            { x: 550, y: 1135 }, // 九位の座標
            { x: 550, y: 1175 }  // 十位の座標
        ];
    
        const fontSize = 28;
        const color = "#000000";
        const fontFamily = "HWT Artz W00 Regular";
    
        for (let i = 0; i < 10; i++) {
            const position = positions[i];
            const text = this.add.text(position.x, position.y, `${rankingData[i].score}`, {
                fontFamily: fontFamily,
                fontSize: fontSize,
                color: color
                //配列の座標の通りに指定したフォント、色、サイズでランキングを表示する
            });
        }
    }
    }
