import Peer, {DataConnection} from "peerjs";

interface UserInfo {
    username: string;
    useraccount: string;
    userId: string;
    avatar: string;
    color: string;
}

export class PeerClient {
    private peer: Peer;
    private conn: DataConnection | null = null;

    private constructor(peer: Peer,) {
        this.peer = peer;
    }

    public async linkToHost(hostId: string) {
        if (this.conn) {
            this.conn.close();
            this.conn = null;
        }

        const conn = await new Promise<DataConnection>((resolve, reject) => {
            const timeOutId = setTimeout(() => {
                reject("链接主机超时");
            }, 5000);
            const conn = this.peer.connect(hostId);
            conn.on("open", () => {
                console.log("monopoly主机链接成功");
                clearTimeout(timeOutId);
                resolve(conn);
            });
            conn.on("error", (e) => {
                clearTimeout(timeOutId);
                reject(e);
            });
        })


        this.conn = conn;
        return this.conn;
    }

    public static async create(host: string, port: number) {
        //向服务器和获取自己的peerId
        const peer = await new Promise<Peer>((resolve, reject) => {
            const peer = new Peer({host, port});
            peer.on("open", (id) => {
                console.log("ice服务器链接成功, ID:", id);
                resolve(peer);
            });
            peer.on("error", (e) => {
                reject(e);
            });
        });
        return new PeerClient(peer);
    }
}
