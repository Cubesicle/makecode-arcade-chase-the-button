class Player {
    private _sprite: Sprite;

    constructor(x: number, y: number, sprite: Sprite) {
        this._sprite = sprite;
        this._sprite.setPosition(x, y);
    }

    public get sprite() {
        return this._sprite;
    }
}

class ButtonConsumable {
    private sprite: Sprite;
    private ready = false;
    private exploded = false;
    private consumed = false;

    constructor(minX: number, minY: number, maxX: number, maxY: number) {
        this.consumed = false;
        this.exploded = false;

        this.sprite = sprites.create(assets.image`blank`, SpriteKind.Food);
        animation.runImageAnimation(this.sprite, assets.animation`buttonEmerge`, 100, false);
        this.sprite.z = -1;
        tiles.placeOnTile(this.sprite, tiles.getTileLocation(Math.randomRange(minX, maxX), Math.randomRange(minY, maxY)));

        setTimeout(() => {
            this.ready = true;
        }, 500);

        setTimeout(() => {
            this.explode();
        }, 1500);
    }

    public checkOverlap(sprite: Sprite) {
        if (sprite.overlapsWith(this.sprite)) {
            this.consume();
        }
    }

    private explode() {
        if (this.consumed) return;

        this.exploded = true;

        info.changeLifeBy(-1);
        animation.runImageAnimation(this.sprite, assets.animation`explosion`, 100, false);
        this.sprite.setScale(2, ScaleAnchor.Middle);
        let text = textsprite.create("-1 hp", 0, 2);
        text.setOutline(1, 15);
        text.setPosition(this.sprite.x + this.sprite.width, this.sprite.y);
        if (text.right > scene.cameraProperty(CameraProperty.Right)) {
            text.setPosition(this.sprite.x - this.sprite.width, text.y);
        }
        text.vy = -25;
        setTimeout(() => {
            this.sprite.destroy();
            text.destroy();
        }, 750);
    }

    public consume() {
        if (!this.ready || this.consumed || this.exploded) return;

        this.consumed = true;
        
        this.sprite.setImage(assets.image`buttonDown`);
        this.sprite.y += 4;
        setTimeout(() => {
            animation.runImageAnimation(this.sprite, assets.animation`explosion2`, 100, false);
            this.sprite.setScale(2, ScaleAnchor.Middle);
            info.changeScoreBy(100);
            let text = textsprite.create("+100 pts", 0, 7);
            text.setOutline(1, 15);
            text.setPosition(this.sprite.x + this.sprite.width, this.sprite.y);
            if (text.right > scene.cameraProperty(CameraProperty.Right)) {
                text.setPosition(this.sprite.x - this.sprite.width, text.y);
            }
            text.vy = -25;
            setTimeout(() => {
                this.sprite.destroy();
                text.destroy();
            }, 750);
        }, 500);
    }
}

let player: Player = new Player(
    screen.width / 2,
    screen.height / 2,
    sprites.create(assets.animation`playerDown`[0], SpriteKind.Player)
);

player.sprite.setStayInScreen(true);
info.setLife(3);
controller.moveSprite(player.sprite);
characterAnimations.loopFrames(player.sprite, assets.animation`playerUp`, 200, characterAnimations.rule(Predicate.MovingUp));
characterAnimations.loopFrames(player.sprite, assets.animation`playerDown`, 200, characterAnimations.rule(Predicate.MovingDown));
characterAnimations.loopFrames(player.sprite, assets.animation`playerLeft`, 200, characterAnimations.rule(Predicate.MovingLeft));
characterAnimations.loopFrames(player.sprite, assets.animation`playerRight`, 200, characterAnimations.rule(Predicate.MovingRight));
tiles.setCurrentTilemap(tilemap`level`);

let button: ButtonConsumable;

game.onUpdateInterval(1800, function() {
    button = new ButtonConsumable(0, 0, 9, 6);
    sprites.onOverlap(SpriteKind.Player, SpriteKind.Food, function (sprite: Sprite, otherSprite: Sprite) {
        button.checkOverlap(player.sprite);
    });
});