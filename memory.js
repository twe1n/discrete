// Константы
let vertices = 0;

// Функции для парсинга данных
const parseAdjMatrix = input => {
    const lines = input.trim().split('\n');
    vertices = parseInt(lines[0]);
    return lines.slice(1).map(line => line.trim().split(' ').map(Number));
};

const parseEdgeList = input => {
    const lines = input.trim().split('\n');
    const [vCount] = lines[0].trim().split(' ').map(Number);
    vertices = vCount;
    return lines.slice(1).map(line => line.trim().split(' ').map(Number));
};

const parseAdjList = input => {
    const lines = input.trim().split('\n');
    vertices = parseInt(lines[0]);
    return lines.slice(1).map(line => line.trim().split(' ').map(Number));
};

// Функции для форматирования данных
const formatAdjMatrix = matrix => `${vertices}\n${matrix.map(row => row.join(' ')).join('\n')}`;

const formatEdgeList = edges => {
    const edgeCount = edges.length;
    return `${vertices} ${edgeCount}\n${edges.map(edge => edge.join(' ')).join('\n')}`;
};

const formatAdjList = adjList => `${vertices}\n${adjList.map(list => `${list.length / 2} ${list.join(' ')}`).join('\n')}`;

// Функции для преобразования представлений графов
const convertAdjMatrixToEdgeList = matrix => {
    const edges = [];
    for (let i = 0; i < vertices; i++) {
        for (let j = 0; j < vertices; j++) {
            if (matrix[i][j] > 0) {
                edges.push([i + 1, j + 1, matrix[i][j]]);
            }
        }
    }
    return edges;
};

const convertEdgeListToAdjMatrix = edges => {
    const matrix = Array.from({ length: vertices }, () => Array(vertices).fill(0));
    edges.forEach(([from, to, weight]) => {
        matrix[from - 1][to - 1] = weight;
    });
    return matrix;
};

const convertAdjListToAdjMatrix = adjList => {
    const matrix = Array.from({ length: vertices }, () => Array(vertices).fill(0));
    for (let i = 0; i < vertices; i++) {
        for (let j = 1; j < adjList[i].length; j += 2) {
            const to = adjList[i][j] - 1;
            const weight = adjList[i][j + 1];
            matrix[i][to] = weight;
        }
    }
    return matrix;
};

const convertAdjMatrixToAdjList = matrix => {
    return Array.from({ length: vertices }, (_, i) => {
        const list = [];
        for (let j = 0; j < vertices; j++) {
            if (matrix[i][j] > 0) {
                list.push(j + 1, matrix[i][j]);
            }
        }
        return list;
    });
};

const convertEdgeListToAdjList = edges => {
    const adjList = Array.from({ length: vertices }, () => []);
    edges.forEach(([from, to, weight]) => {
        adjList[from - 1].push(to, weight);
    });
    return adjList;
};

// Функции для обновления полей ввода
const updateFromMatrix = () => {
    const input = document.getElementById('adjMatrixInput').value;
    const matrix = parseAdjMatrix(input);
    document.getElementById('edgeListInput').value = formatEdgeList(convertAdjMatrixToEdgeList(matrix));
    document.getElementById('adjListInput').value = formatAdjList(convertAdjMatrixToAdjList(matrix));
};

const updateFromEdgeList = () => {
    const input = document.getElementById('edgeListInput').value;
    const edges = parseEdgeList(input);
    const adjMatrix = convertEdgeListToAdjMatrix(edges);
    document.getElementById('adjMatrixInput').value = formatAdjMatrix(adjMatrix);
    document.getElementById('adjListInput').value = formatAdjList(convertEdgeListToAdjList(edges));
};

const updateFromAdjList = () => {
    const input = document.getElementById('adjListInput').value;
    const adjList = parseAdjList(input);
    const adjMatrix = convertAdjListToAdjMatrix(adjList);
    document.getElementById('adjMatrixInput').value = formatAdjMatrix(adjMatrix);
    document.getElementById('edgeListInput').value = formatEdgeList(convertAdjMatrixToEdgeList(adjMatrix));
};

// Обработка событий кнопок
document.getElementById('convertMatrix').addEventListener('click', updateFromMatrix);
document.getElementById('convertEdgeList').addEventListener('click', updateFromEdgeList);
document.getElementById('convertAdjList').addEventListener('click', updateFromAdjList);

// Функции для сохранения данных в файл
const downloadFile = (filename, content) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = filename;
    link.click();
};

// Обработка событий скачивания
const saveMatrixAsFile = () => downloadFile('adjMatrix.txt', document.getElementById('adjMatrixInput').value);
const saveEdgeListAsFile = () => downloadFile('edgeList.txt', document.getElementById('edgeListInput').value);
const saveAdjListAsFile = () => downloadFile('adjList.txt', document.getElementById('adjListInput').value);

// Функции для загрузки данных из файла
const loadFile = (inputId, outputId) => {
    const fileInput = document.getElementById(inputId);
    if (fileInput.files.length === 0) {
        console.warn('Нет файлов для загрузки.');
        return;
    }

    const file = fileInput.files[0];
    
    const reader = new FileReader();
        
    reader.onload = function(e) {
        const content = e.target.result; // Получаем содержимое файла
        document.getElementById(outputId).value = content; // Обновляем текстовое поле
        // Обновляем данные после загрузки
        if (inputId === 'loadMatrixInput') updateFromMatrix();
        if (inputId === 'loadEdgeListInput') updateFromEdgeList();
        if (inputId === 'loadAdjListInput') updateFromAdjList();
    };

    reader.onerror = function(error) {
        console.error('Ошибка при чтении файла:', error);
    };

    // Читаем файл как текст
    reader.readAsText(file);
};

// Обработка загрузки файлов
document.getElementById('loadMatrixInput').addEventListener('change', () => loadFile('loadMatrixInput', 'adjMatrixInput'));
document.getElementById('loadEdgeListInput').addEventListener('change', () => loadFile('loadEdgeListInput', 'edgeListInput'));
document.getElementById('loadAdjListInput').addEventListener('change', () => loadFile('loadAdjListInput', 'adjListInput'));

// Удаление предыдущих данных до нажатия кнопки
const clearOutputs = () => {
    document.getElementById('edgeListInput').value = '';
    document.getElementById('adjListInput').value = '';
};

// Обработка событий ввода
['adjMatrixInput', 'edgeListInput', 'adjListInput'].forEach(id => {
    document.getElementById(id).addEventListener('input', clearOutputs);
});

// Обработка сохранения файлов
document.getElementById('saveMatrix').onclick = saveMatrixAsFile;
document.getElementById('saveEdgeList').onclick = saveEdgeListAsFile;
document.getElementById('saveAdjList').onclick = saveAdjListAsFile;
