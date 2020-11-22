export class Endpoint {
    type: string;
    endpointServiceId: string;
    rtmpUrl: string;
}
export declare interface User {

	/**
	 * Email of the user
	 */
	email:string;

	/**
	 * Type of the user
	 */
	userType:String;

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
	from:User;

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
    webRTCViewerCount : number;
    webRTCViewerLimit : number;
    hlsViewerLimit: number;
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
        name: string;
        type: string;
        streamId: string;
        streamUrl: string;
        hlsViewerCount: number;
        webRTCViewerCount: number;
        rtmpViewerCount: number;
        mp4Enabled: number;
}


export class Playlist {
    playlistId: string;
    currentPlayIndex: number;
    playlistName: string;
    playlistStatus: string;
    broadcastItemList: PlaylistItem[];
    creationDate: number;
    duration: number;
}

export class ServerSettings {

    constructor(public serverName: string,
                public licenceKey: string,
                public buildForMarket: boolean,
    ) {}
}

export class AppSettings {

    constructor(public mp4MuxingEnabled: boolean,
                public webMMuxingEnabled: boolean,
                public addDateTimeToMp4FileName: boolean,
                public hlsMuxingEnabled: boolean,
                public hlsListSize: number,
                public hlsTime: number,
                public hlsPlayListType: string,
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
                public ipFilterEnabled: boolean
    ) {}
}
