type NowFn = () => number;

export class SlidingWindowCounter {
  private timestamps: number[] = [];
  constructor(private windowMs: number, private now: NowFn = () => Date.now()) {}

  push(): number {
    const t = this.now();
    this.timestamps.push(t);
    this.clean();
    return this.timestamps.length;
  }

  count(): number {
    this.clean();
    return this.timestamps.length;
  }

  private clean() {
    const cutoff = this.now() - this.windowMs;
    while (this.timestamps.length && this.timestamps[0] < cutoff) {
      this.timestamps.shift();
    }
  }
}