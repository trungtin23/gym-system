export class ResponeData<T> {
  message: string;
  status: number;
  data: T | T[];

  constructor(message: string, status: number, data: T | T[]) {
    this.message = message;
    this.status = status;
    this.data = data;
  }
}
