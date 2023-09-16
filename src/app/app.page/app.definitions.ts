export class Endpoint {
    type: string;
    endpointServiceId: string;
    rtmpUrl: string;
}
export declare interface UserInf {

	/**
	 * Email of the user
	 */
	email:string;

	/**
	 * Type of the user
	 */
	userType:string;

    /**
	 * Scope of user
	 */
    scope:string;

	/**
	 * Name of the user
	 */
	fullName:string;

	/**
	 * URL of the picture if exists
	 */
	picture:string;

	/**
	 * ID of the user
	 */
    id:string;
}

export declare interface UserInfoTable {
    dataRows: UserInf[];
}


export declare interface LiveComment {
    /**
	 * id of the comment
	 */
	id:string;

	/**
	 * Content of the comment
	 */
	message:string;

	/**
	 * User who write this comment
	 */
	from:UserInf;

	/**
	 * Origin of the comment
	 */
	origin:string;

	/**
	 * Timestamp of the comment
	 */
	timestamp:number;
}


export declare interface BroadcastInfo {
    name: string;
    type: string;
    streamId: string;
    viewerCount: number;
    status: string;
    endPointList: Endpoint[];
    playListItemList: PlaylistItem[];
    ipAddr: string;
    username: string;
    password: string;
    rtspUrl: string;
    date: number;
    duration: number;
    iframeSource: string;
    quality: string;
    speed: number;
    hlsViewerCount: number;
    dashViewerCount: number;
    webRTCViewerCount : number;
    webRTCViewerLimit : number;
    hlsViewerLimit: number;
    dashViewerLimit: number;
    rtmpViewerCount : number;
    mp4Enabled : number;
    webMEnabled : number;
    originAdress : string;
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
    streamName: string;
    streamId: string;
    vodName: string;
    creationDate: string;
    duration: string;
}

export declare interface CamStreamInfo {
    name: string;
    type: string;
    streamId: string;
    viewerCount: number;
    status: string;
    endPointList: Endpoint[];
    vodList: VOD[];
    ipAddr: string
}

export declare interface VodInfo {
    streamName: string;
    streamId: string;
    filePath: string;
    viewerCount: number;
    vodName: string;
    creationDate: number;
    duration: number;
    fileSize: number;
    vodId: string;

}

export declare interface EncoderSettings {
    height: Number;
    videoBitrate: number;
    audioBitrate: number;
}

export declare interface VodInfoTable {
    dataRows: VodInfo[];
}

export declare interface CameraInfoTable {
    list: CamStreamInfo[];
}

export declare interface WebRTCClientStat {
    measuredBitrate: number;
    sendBitrate: number;
    videoFrameSendPeriod: number;
    audioFrameSendPeriod: number;
    videoThreadCheckInterval: number;
    audioThreadCheckInterval: number;
}

export declare interface PlaylistItem {
        streamUrl: string;
        type: string;
}

export class ServerSettings {

    constructor(public serverName: string,
                public licenceKey: string,
                public buildForMarket: boolean,
                public logLevel: string,
                public sslEnabled: boolean,
    ) {}
}

export enum SslConfigurationType {
    NO_SSL = "No SSL",
    CUSTOM_DOMAIN ="Use Your Domain",
    ANTMEDIA_SUBDOMAIN ="Subdomain of antmedia.cloud",
    CUSTOM_CERTIFICATE = "Import Your Certificate"
    
  }


export class AppSettings {

    constructor(public mp4MuxingEnabled: boolean,
                public webMMuxingEnabled: boolean,
                public addDateTimeToMp4FileName: boolean,
                public hlsMuxingEnabled: boolean,
                public hlsListSize: number,
                public hlsTime: number,
                public hlsPlayListType: string,
                public deleteHLSFilesOnEnded: boolean,
                public facebookClientId: string,
                public facebookClientSecret: string,
                public youtubeClientId: string,
                public youtubeClientSecret: string,
                public periscopeClientId: string,
                public periscopeClientSecret: string,
                public encoderSettings: EncoderSettings[],
                public acceptOnlyStreamsInDataStore: boolean,
                public vodFolder: string,
                public objectDetectionEnabled: boolean,
                public publishTokenControlEnabled: boolean,
                public playTokenControlEnabled: boolean,

                public timeTokenSubscriberOnly: boolean,

                public webRTCEnabled: boolean,
                public webRTCFrameRate: number,
                public remoteAllowedCIDR: string,
                public h264Enabled: boolean,
                public vp8Enabled: boolean,
                public dataChannelEnabled: boolean,
                public dataChannelPlayerDistribution: string,
                public listenerHookURL: string,
                public jwtControlEnabled: boolean,
                public jwtSecretKey: string,
                public ipFilterEnabled: boolean,
                public jwtStreamSecretKey: string,
                public playJwtControlEnabled: boolean,
                public publishJwtControlEnabled: boolean,
                public generatePreview: boolean,
                public s3RecordingEnabled: boolean,
                public s3AccessKey: string,
                public s3SecretKey: string,
                public s3RegionName: string,
                public s3BucketName: string,
                public s3Endpoint: string,
                public s3Permission: string,
                public enableTimeTokenForPlay: boolean,
                public enableTimeTokenForPublish: boolean,
                public dashMuxingEnabled: boolean,
                public dashSegmentDuration: number,
                public dashFragmentDuration: number,
                public lLDashEnabled: boolean, 
                public lLHLSEnabled: boolean,
                public deleteDASHFilesOnEnded: boolean,
                public timeTokenSecretForPlay: string,
                public timeTokenSecretForPublish: string

    ) {}
}

export class Licence {
    constructor(
    public licenceId: string,
    public startDate: number,
    public endDate: number,
    public type: string,
    public licenceCount: string,
    public owner: string,
    public status: string,
    public hourUsed: number = 0
    ){}
}