export declare interface Endpoint {
    type: string;
}


export declare interface BroadcastInfo {
    name: string;
    type: string;
    streamId: string;
    viewerCount: number;
    status: string;
    endPointList: Endpoint[];
    ipAddr: string;
    username: string;
    password: string;
    rtspUrl: string;
    date: number;
    duration: number;
    iframeSource: string;
}

export declare interface BroadcastInfoTable {
    dataRows: BroadcastInfo[];
}

export declare interface VideoServiceEndpoint {
    id: string,
    accountName: string,
    serviceName: string,
    accountType: string,
}

export declare interface VOD {
    type: string;
    streamName:string;
    streamId:string;
    vodName:string;
    creationDate:string;
    duration:string;
}

export declare interface CamStreamInfo{
    name: string;
    type:string;
    streamId: string;
    viewerCount: number;
    status: string;
    endPointList: Endpoint[];
    vodList:VOD[];
    ipAddr:string
}

export declare interface VodInfo{
    streamName: string;
    streamId:string;
    filePath: string;
    viewerCount: number;
    vodName: string;
    creationDate:number;
    duration:number;
    fileSize:number;
    vodId:string;

}

export declare interface EncoderSettings {
    height: Number;
    videoBitrate: Number;
    audioBitrate: Number;
}

export declare interface VodInfoTable {
    dataRows: VodInfo[];
}
export declare interface CameraInfoTable{
    list:CamStreamInfo[];
}