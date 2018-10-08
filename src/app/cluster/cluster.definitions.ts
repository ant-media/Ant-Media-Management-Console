export declare interface ClusterNode {
    nodeId: string;
    nodeIp: string;
    status: string;
}

export declare interface ClusterNodeInfo {
    id: string;
    ip: string;
    status: string;
}

export declare interface ClusterInfoTable {
    dataRows: ClusterNodeInfo[];
}
