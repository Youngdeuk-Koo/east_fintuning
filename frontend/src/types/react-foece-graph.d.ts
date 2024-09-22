declare module 'react-force-graph' {
    import { Component } from 'react';

    interface NodeObject {
        id: string;
    }

    interface LinkObject {
        source: string;
        target: string;
        value: number;
    }

    interface GraphData {
        nodes: NodeObject[];
        links: LinkObject[];
    }

    interface ForceGraph2DProps {
        graphData: GraphData;
        nodeAutoColorBy?: string;
        linkDirectionalParticles?: string;
        linkDirectionalParticleSpeed?: (link: LinkObject) => number;
    }

    export class ForceGraph2D extends Component<ForceGraph2DProps> {}
}