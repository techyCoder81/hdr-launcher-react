import theme from "../../assets/theme.wav";

export default class BackgroundMusic {
  private static instance: BackgroundMusic;
  music: HTMLAudioElement;
  fadeInterval: NodeJS.Timer | null = null;
  
  public static singleton(): BackgroundMusic {
    if (BackgroundMusic.instance === undefined) {
      BackgroundMusic.instance = new BackgroundMusic();
    }
    return BackgroundMusic.instance;
  }

  private constructor() {
    this.music = new Audio(theme);
    this.music.load();
    this.music.volume = 0.1;
    
    this.music.play();
    this.music.addEventListener('ended', () => {
      this.music.currentTime = 0;
      this.music.play();
    });
  }

  public isFading() {
    return this.fadeInterval
  }

  public play(): Promise<void> {
    return new Promise<void>(() => this.music.play());
  }
  public pause(): Promise<void> {
    return new Promise<void>(() => this.music.pause());
  }

  public fadeOut(): Promise<number> {
    return this.fadeTo(0);
  }

  public fadeIn(): Promise<number> {
    return this.fadeTo(0.95);
  }

  public fadeTo(target_volume: number): Promise<number> {
    target_volume = Math.min(Math.max(0, target_volume), 0.95);
    // if we are already fading, cancel the previous fade
    if (this.fadeInterval !== null) {
      clearInterval(this.fadeInterval);
    }
    let music = this.music
    let vol = this.music.volume;
    
    return new Promise<number>((resolve) => {
      BackgroundMusic.singleton().fadeInterval = setInterval(
        function() {
          if (vol !== target_volume) {
            vol = Math.min(Math.max(vol + (0.05 * Math.sign(target_volume - vol)), 0), 0.95);
            music.volume = vol;
          }
          else {
            
            let interval = BackgroundMusic.singleton().fadeInterval;
            if (interval !== null) {
              clearInterval(interval);
              BackgroundMusic.singleton().fadeInterval = null;
              resolve(vol);
            }
          }
        }, 150);
    });
  }
}