const validateWorkflow = (nodes,edges) => {

    const nodeIds = new Set(nodes.map(n => n.id));



    for(const edge of edges){
        if(!nodeIds.has(edge.fromNodeId) || !nodeIds.has(edge.toNodeId)){
            throw new Error("Invalid edge");
        }
    }

    const graph = {};

    nodes.forEach(n => (graph[n.id] = []));
    edges.forEach(e => graph[e.fromNodeId].push(e.toNodeId));

    const visited = new Set();
    const stack = new Set();

    const dfs = (node) => {

        if(stack.has(node)) throw new Error("Cycle detected");
        if(visited.has(node)) return;

        stack.add(node);
        visited.add(node);
        for(const next of graph[node]){
            dfs(next);
        }

        stack.delete(node);
    };

    nodes.forEach(n => dfs(n.id));
};

export default validateWorkflow;
