// 定义全局变量，保存连接状态，
// 避免每次连接导致的耗时
export class GlobalData {
  redisConnected:Boolean;
  dbConnected:Boolean;

  constructor(){this.redisConnected = false; this.dbConnected=false}
}
