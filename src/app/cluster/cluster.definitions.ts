export declare interface ClusterNode {
    nodeId: string;
    nodeIp: string;
    status: string;
    lastUpdateTime: string;
    inTheCluster: string;
    memory: string;
    cpu: string;
}

export declare interface ClusterNodeInfo {
    id: string;
    ip: string;
    status: string;
    lastUpdateTime: string;
    inTheCluster: string;
    memory: string;
    cpu: string;
}

export declare interface ClusterInfoTable {
    dataRows: ClusterNodeInfo[];
}
