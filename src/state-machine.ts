export enum AppState {
  Idle = "idle",
  Recording = "recording",
  Processing = "processing",
}

export type StateListener = (state: AppState) => void;

export class StateMachine {
  private state: AppState = AppState.Idle;
  private listeners: Set<StateListener> = new Set();

  getState(): AppState {
    return this.state;
  }

  isIdle(): boolean {
    return this.state === AppState.Idle;
  }

  isRecording(): boolean {
    return this.state === AppState.Recording;
  }

  isProcessing(): boolean {
    return this.state === AppState.Processing;
  }

  transition(next: AppState): boolean {
    if (!this.canTransition(this.state, next)) {
      return false;
    }
    this.state = next;
    this.notify();
    return true;
  }

  private canTransition(from: AppState, to: AppState): boolean {
    const allowed: Record<AppState, AppState[]> = {
      [AppState.Idle]: [AppState.Recording],
      [AppState.Recording]: [AppState.Processing, AppState.Idle],
      [AppState.Processing]: [AppState.Idle, AppState.Recording],
    };
    return allowed[from].includes(to);
  }

  onStateChange(listener: StateListener): { dispose: () => void } {
    this.listeners.add(listener);
    return {
      dispose: () => {
        this.listeners.delete(listener);
      },
    };
  }

  private notify(): void {
    for (const listener of this.listeners) {
      listener(this.state);
    }
  }
}
