const nodes = [
    { id: 'A' }, { id: 'B' }, { id: 'C' },
    { id: 'D' }, { id: 'E' }
];

let links = [
    { source: 'A', target: 'B', duration: 5 },
    { source: 'A', target: 'C', duration: 7 },
    { source: 'A', target: 'D', duration: 2 },
    { source: 'A', target: 'E', duration: 1 },
    { source: 'B', target: 'C', duration: 3 },
    { source: 'B', target: 'D', duration: 4 },
    { source: 'B', target: 'E', duration: 4 },
    { source: 'C', target: 'D', duration: 6 },
    { source: 'C', target: 'E', duration: 3 },
    { source: 'D', target: 'E', duration: 8 }
];

const presets = {
    preset1: [
        { source: "A", target: "B", duration: 5 },
        { source: "B", target: "C", duration: 1 },
        { source: "C", target: "D", duration: 3 },
        { source: "D", target: "A", duration: 3 },
        { source: "E", target: "A", duration: 9 },
        { source: "E", target: "D", duration: 5 },
        { source: "E", target: "C", duration: 1 },
    ],
    preset2: [
    	{ source: "A", target: "D", duration: 2 },
    	{ source: "B", target: "A", duration: 1 },
    	{ source: "B", target: "C", duration: 2 },
    	{ source: "C", target: "A", duration: 5 },
    	{ source: "C", target: "D", duration: 3 },
    	{ source: "D", target: "E", duration: 5 },
    	{ source: "D", target: "D", duration: 2 },
    	{ source: "E", target: "A", duration: 3 },
    ],
};

const svg = d3.select("svg");
const width = +svg.attr("width");
const height = +svg.attr("height");

// Add a marker to define a smaller arrowhead
svg.append("defs").append("marker")
    .attr("id", "arrowhead")
    .attr("viewBox", "0 0 10 10")
    .attr("refX", 25) // Adjust position of the arrowhead
    .attr("refY", 5)
    .attr("markerWidth", 5) // Smaller size for the arrowhead
    .attr("markerHeight", 5)
    .attr("orient", "auto")
    .append("polygon")
    .attr("points", "0 0, 10 5, 0 10")
    .attr("fill", "#999"); // Default fill color for the arrowhead

const simulation = d3.forceSimulation(nodes)
    .force("link", d3.forceLink().id(d => d.id).distance(d => d.duration * 60))
    .force("charge", d3.forceManyBody().strength(-400))
    .force("center", d3.forceCenter(width / 2, height / 2));

const gLinks = svg.append("g").attr("class", "links");
const gNodes = svg.append("g").attr("class", "nodes");
const gLabels = svg.append("g").attr("class", "labels");
const gLinkLabels = svg.append("g").attr("class", "link-labels");
const gLoops = svg.append("g").attr("class", "loops");

const updateGraph = () => {
    clearGraphGroups();

    renderLinks();
    renderNodes();
    renderLabels();
    renderLinkLabels();
    renderLoops();

    simulation.nodes(nodes).on("tick", ticked);
    simulation.force("link").links(links);
    simulation.alpha(1).restart();
};

const clearGraphGroups = () => {
    gLinks.selectAll("line").remove();
    gNodes.selectAll("circle").remove();
    gLabels.selectAll("text").remove();
    gLinkLabels.selectAll("text").remove();
    gLoops.selectAll("path").remove();
    gLoops.selectAll("text").remove();
};

const renderLinks = () => {
    const linkEnter = gLinks.selectAll("line")
        .data(links)
        .enter().append("line")
        .attr("class", "link")
        .attr("stroke-width", d => d.duration)
        .attr("marker-end", d => d.source !== d.target ? "url(#arrowhead)" : null); // Remove arrows for loops
};


const renderNodes = () => {
    gNodes.selectAll("circle")
        .data(nodes)
        .enter().append("circle")
        .attr("class", "node")
        .attr("r", 8)
        .attr("fill", "blue")
        .call(d3.drag()
            .on("start", dragStarted)
            .on("drag", dragged)
            .on("end", dragEnded));
};

const renderLabels = () => {
    gLabels.selectAll("text")
        .data(nodes)
        .enter().append("text")
        .attr("class", "label")
        .attr("dx", 12)
        .attr("dy", ".35em")
        .attr("fill", "#FFFFFF") // Установим цвет текста на белый
        .text(d => d.id);
};

const renderLinkLabels = () => {
    gLinkLabels.selectAll("text")
        .data(links)
        .enter().append("text")
        .attr("class", "link-label")
        .attr("text-anchor", "middle")
        .attr("dy", -5)
        .attr("fill", "#FFFFFF") // Установим цвет текста на белый
        .text(d => d.duration)
        .on("click", updateLinkDuration);
};

const updateLinkDuration = (event, d) => {
    const newDuration = prompt(`Введите новую длину для ${d.source.id} - ${d.target.id}:`, d.duration);
    if (newDuration !== null) {
        d.duration = +newDuration;
        updateGraph();
    }
};

const renderLoops = () => {
    nodes.forEach(node => {
        const loopPath = d3.path();
        loopPath.arc(node.x, node.y - 20, 20, 0, 2 * Math.PI);

        gLoops.append("path")
            .attr("class", "loop")
            .attr("d", loopPath)
            .attr("data-node", node.id)
            .on("click", editLoopDuration)
            .lower();
    });
};

const editLoopDuration = (event) => {
    const nodeId = d3.select(this).attr("data-node");
    const newDuration = prompt(`Введите новую длину петли для ${nodeId}:`, "0");
    if (newDuration !== null) {
        const existingLink = links.find(link => link.source.id === nodeId && link.target.id === nodeId);
        if (existingLink) {
            existingLink.duration = +newDuration;
        } else {
            links.push({ source: nodeId, target: nodeId, duration: +newDuration });
        }
        updateGraph();
    }
};

document.getElementById("loadPreset1").addEventListener("click", function() {
    loadPreset(presets.preset1);
});

document.getElementById("loadPreset2").addEventListener("click", function() {
    loadPreset(presets.preset2);
});

const loadPreset = (preset) => {
    nodes.length = 0; // Очистка текущих узлов
    links.length = 0; // Очистка текущих ссылок

    // Добавление новых ссылок из пресета
    preset.forEach(link => {
        links.push(link);
        if (!nodes.find(n => n.id === link.source)) {
            nodes.push({ id: link.source });
        }
        if (!nodes.find(n => n.id === link.target)) {
            nodes.push({ id: link.target });
        }
    });

    updateGraph();
};

// Event listeners for node selection
const nodeSelect = d3.select("#nodeSelect");
nodeSelect.selectAll("option")
    .data(nodes)
    .enter().append("option")
    .attr("value", d => d.id)
    .text(d => d.id);

nodeSelect.on("change", function () {
    const selectedNodeId = d3.select(this).property("value");
    resetNodeSelection();
    highlightSelectedNode(selectedNodeId);
    updateLoop(selectedNodeId);
});

// Dijkstra button functionality
document.getElementById("dijkstraButton").addEventListener("click", function () {
    const selectedNodeId = nodeSelect.property("value");
    clearPreviousPaths();
    runDijkstra(selectedNodeId);
});

// Floyd-Warshall button functionality
document.getElementById("floydButton").addEventListener("click", function () {
    runFloydWarshall();
});

// Helper functions
const clearPreviousPaths = () => {
    d3.selectAll("line.shortest-path").attr("class", "link");
    gLoops.selectAll("path").remove();
    gLoops.selectAll("text").remove();
};

const resetNodeSelection = () => {
    gNodes.selectAll("circle").attr("class", "node").attr("fill", "blue");
};

const highlightSelectedNode = (selectedNodeId) => {
    gNodes.selectAll("circle")
        .filter(d => d.id === selectedNodeId)
        .attr("class", "selected-node");
};

const runDijkstra = (startId) => {
    const distances = {};
    const previousNodes = {};
    const unvisitedNodes = new Set(nodes.map(node => node.id));
    const steps = [];

    nodes.forEach(node => {
        distances[node.id] = Infinity;
        previousNodes[node.id] = null;
    });
    distances[startId] = 0;

    let step = 1;
    let previousSelected = null;

    while (unvisitedNodes.size > 0) {
        const currentNodeId = getClosestNode(unvisitedNodes, distances);
        unvisitedNodes.delete(currentNodeId);

        const stepData = {
            step: step,
            selected: currentNodeId,
            distances: { ...distances },
            previousSelected: previousSelected
        };
        steps.push(stepData);

        previousSelected = currentNodeId;
        updateDistances(currentNodeId, distances, previousNodes);
        step++;
    }

    updateInfoPanel(steps);
    drawShortestPaths(previousNodes, startId);
};

const runFloydWarshall = () => {
    const n = nodes.length;
    const indexMap = {};
    
    // Initialize the index map
    nodes.forEach((node, i) => {
        indexMap[node.id] = i;
    });

    // Create a distance matrix
    let distances = Array(n).fill().map(() => Array(n).fill(Infinity));
    
    // Set the distances for direct links and loops
    links.forEach(link => {
        const sourceIndex = indexMap[link.source.id];
        const targetIndex = indexMap[link.target.id];
        distances[sourceIndex][targetIndex] = link.duration;
    });

    // Distance from each node to itself is zero
    nodes.forEach((node, i) => {
        distances[i][i] = 0;
    });

    // Floyd-Warshall Algorithm
    for (let k = 0; k < n; k++) {
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                if (distances[i][j] > distances[i][k] + distances[k][j]) {
                    distances[i][j] = distances[i][k] + distances[k][j];
                }
            }
        }
    }

    // Update the table with the results
    updateFloydTable(distances);
};

const updateFloydTable = (distances) => {
    const tableBody = document.getElementById('floydTableBody');
    tableBody.innerHTML = ""; // Clear existing content

    nodes.forEach((node, i) => {
        const row = tableBody.insertRow();
        // Insert the node ID into the first cell
        row.insertCell().textContent = node.id;

        nodes.forEach((_, j) => {
            const cell = row.insertCell();
            // Add distance or '∞' for unreachable pairs
            cell.textContent = distances[i][j] === Infinity ? '∞' : distances[i][j];
        });
    });
};

const updateDistances = (currentNodeId, distances, previousNodes) => {
    const neighbors = getNeighbors(currentNodeId);
    neighbors.forEach(neighbor => {
        const alt = distances[currentNodeId] + getLinkDuration(currentNodeId, neighbor);
        if (alt < distances[neighbor]) {
            distances[neighbor] = alt;
            previousNodes[neighbor] = currentNodeId;
        }
    });
};

const updateInfoPanel = (steps) => {
    const tableBody = document.getElementById('dijkstraTableBody');
    tableBody.innerHTML = "";
    let selectedVertices = [];

    steps.forEach(({ step, selected, distances }) => {
        const row = tableBody.insertRow();
        row.insertCell().textContent = step;

        ["A", "B", "C", "D", "E"].forEach(id => {
            const cell = row.insertCell();
            if (selectedVertices.includes(id)) {
                cell.textContent = '-'; 
            } else {
                cell.textContent = distances[id] === Infinity ? '∞' : distances[id];
            }
        });

        selectedVertices.push(selected);
        row.insertCell().textContent = selected;
    });
};

const getClosestNode = (unvisited, distances) => {
    return [...unvisited].reduce((closest, nodeId) =>
        distances[nodeId] < distances[closest] ? nodeId : closest
    );
};

const getNeighbors = (nodeId) => {
    return links
        .filter(link => link.source.id === nodeId) // Check outgoing edges only
        .map(link => link.target.id);
};


const getLinkDuration = (sourceId, targetId) => {
    const link = links.find(link =>
        link.source.id === sourceId && link.target.id === targetId
    );
    return link ? link.duration : Infinity; // Return Infinity if there is no direct link
};

const drawShortestPaths = (previousNodes, startId) => {
    Object.keys(previousNodes).forEach(nodeId => {
        if (previousNodes[nodeId] !== null && nodeId !== startId) {
            createPath(nodeId, previousNodes, startId);
        }
    });
};

const createPath = (nodeId, previousNodes, startId) => {
    const path = [];
    let currentNodeId = nodeId;
    while (currentNodeId !== null) {
        path.unshift(currentNodeId);
        currentNodeId = previousNodes[currentNodeId];
    }
    if (path[0] === startId) {
        for (let i = 1; i < path.length; i++) {
            changePathLinkColor(path[i - 1], path[i]);
        }
    }
};

const changePathLinkColor = (sourceId, targetId) => {
    const link = links.find(l =>
        l.source.id === sourceId && l.target.id === targetId // Only consider directed edges
    );
    if (link) {
        d3.selectAll("line.link")
            .filter(function(d) {
                return (d.source.id === sourceId && d.target.id === targetId);
            })
            .attr("class", "shortest-path") // Assign a new class to highlight it
            .attr("stroke", "red"); // Change the stroke color to red
    }
};

const ticked = () => {
    gLinks.selectAll("line")
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);

    gNodes.selectAll("circle")
        .attr("cx", d => d.x)
        .attr("cy", d => d.y);

    gLabels.selectAll("text")
        .attr("x", d => d.x)
        .attr("y", d => d.y);

    gLinkLabels.selectAll("text")
        .attr("x", d => (d.source.x + d.target.x) / 2)
        .attr("y", d => (d.source.y + d.target.y) / 2);

    gLoops.selectAll("path").each(function() {
        const nodeId = d3.select(this).attr("data-node");
        const node = nodes.find(n => n.id === nodeId);
        const loopPath = d3.path();
        loopPath.arc(node.x, node.y - 20, 20, 0, 2 * Math.PI);
        d3.select(this).attr("d", loopPath);
    });

    gLoops.selectAll("text").each(function() {
        const nodeId = d3.select(this).attr("data-node");
        const node = nodes.find(n => n.id === nodeId);
        const loopLabel = links.find(link => link.source.id === node.id && link.target.id === node.id)?.duration || "";
        d3.select(this)
            .attr("x", node.x)
            .attr("y", node.y - 20)
            .attr("fill", "#FFFFFF") // Установим цвет текста на белый
            .text(loopLabel);
    });
};

const dragStarted = (event) => {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    event.subject.fx = event.subject.x;
    event.subject.fy = event.subject.y;
};

const dragged = (event) => {
    event.subject.fx = event.x;
    event.subject.fy = event.y;
};

const dragEnded = (event) => {
    if (!event.active) simulation.alphaTarget(0);
    event.subject.fx = null;
    event.subject.fy = null;
};

// Initial graph rendering
updateGraph();
