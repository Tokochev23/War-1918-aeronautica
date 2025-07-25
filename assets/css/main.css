/* assets/css/main.css */

/* Custom scrollbar */
::-webkit-scrollbar {
    width: 8px;
    height: 8px;
}
::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 10px;
}
::-webkit-scrollbar-thumb {
    background: #a8a8a8;
    border-radius: 10px;
}
::-webkit-scrollbar-thumb:hover {
    background: #888;
}

body {
    font-family: 'Inter', sans-serif;
    background: linear-gradient(135deg, #87CEEB 0%, #1E90FF 100%); /* Gradiente de céu azul */
    min-height: 100vh;
    padding: 20px;
    color: #333;
}

.container {
    max-width: 1400px;
    margin: 0 auto;
    background: white;
    border-radius: 15px;
    overflow: hidden;
    box-shadow: 0 20px 40px rgba(0,0,0,0.2);
}

/* Header Section */
.header {
    background: linear-gradient(45deg, #4682B4, #5F9EA0); /* Gradiente de aço/azul ardósia */
    color: white;
    padding: 30px;
    text-align: center;
    border-bottom: 5px solid #2F4F4F;
}

.header h1 {
    font-size: 2.5rem;
    margin-bottom: 10px;
    text-shadow: 2px 2px 4px rgba(0,0,0,0.4);
}

.header p {
    font-size: 1.1rem;
    opacity: 0.9;
}

.main-content {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 30px;
    padding: 30px;
}

.form-section {
    background: #f8f9fa;
    padding: 25px;
    border-radius: 10px;
    margin-bottom: 20px;
    border-left: 5px solid #4682B4; /* Borda azul aço */
    box-shadow: 0 2px 5px rgba(0,0,0,0.05);
}

.form-section h3 {
    color: #2F4F4F; /* Cinza ardósia escuro */
    margin-bottom: 20px;
    font-size: 1.3rem;
    display: flex;
    align-items: center;
    gap: 10px;
}

.form-group {
    margin-bottom: 15px;
}

.form-group label {
    display: block;
    margin-bottom: 5px;
    font-weight: 600;
    color: #495057;
}

input[type="text"], input[type="number"], select {
    width: 100%;
    padding: 10px;
    border: 1px solid #ced4da;
    border-radius: 5px;
    font-size: 1rem;
    transition: border-color 0.3s, box-shadow 0.3s;
    background-color: #fff;
    color: #333;
}

input[type="text"]:focus, input[type="number"]:focus, select:focus {
    outline: none;
    border-color: #4682B4;
    box-shadow: 0 0 0 3px rgba(70, 130, 180, 0.25);
}

input[type="checkbox"] {
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    display: inline-block;
    vertical-align: middle;
    height: 20px;
    width: 20px;
    border: 2px solid #6c757d;
    border-radius: 4px;
    background-color: white;
    cursor: pointer;
    transition: background-color 0.2s, border-color 0.2s;
    position: relative;
}

input[type="checkbox"]:checked {
    background-color: #4682B4;
    border-color: #4682B4;
}

input[type="checkbox"]:checked::after {
    content: '✔';
    display: block;
    color: white;
    font-size: 14px;
    line-height: 16px;
    text-align: center;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
}

.item-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: #f7fafc;
    padding: 10px;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    margin-bottom: 8px;
}

.item-row label {
    color: #343a40;
    flex-grow: 1;
    margin-left: 10px;
}

.item-row input[type="number"] {
    width: 80px;
    text-align: center;
    background-color: #e9ecef;
    border: 1px solid #ced4da;
}

/* Tooltip style */
.tooltip {
    position: relative;
    display: inline-block;
    cursor: help;
}

.tooltip .tooltiptext {
    visibility: hidden;
    width: 220px;
    background-color: #333;
    color: #fff;
    text-align: center;
    border-radius: 6px;
    padding: 8px;
    position: absolute;
    z-index: 1;
    bottom: 125%;
    left: 50%;
    margin-left: -110px;
    opacity: 0;
    transition: opacity 0.3s;
    font-size: 0.85rem;
    font-weight: 400;
}

.tooltip .tooltiptext::after {
    content: "";
    position: absolute;
    top: 100%;
    left: 50%;
    margin-left: -5px;
    border-width: 5px;
    border-style: solid;
    border-color: #333 transparent transparent transparent;
}

.tooltip:hover .tooltiptext {
    visibility: visible;
    opacity: 1;
}

/* Summary Panel */
.summary-panel {
    background: white;
    border-radius: 10px;
    padding: 25px;
    height: fit-content;
    position: sticky;
    top: 20px;
    border: 1px solid #dee2e6;
    box-shadow: 0 5px 15px rgba(0,0,0,0.08);
}

.summary-panel h3 {
    color: #2F4F4F;
    margin-bottom: 20px;
    text-align: center;
    font-size: 1.4rem;
}

/* Status Indicator */
.status-indicator {
    padding: 10px 15px;
    border-radius: 8px;
    margin-top: 20px;
    text-align: center;
    font-weight: 600;
    font-size: 0.95rem;
    transition: background-color 0.3s, color 0.3s;
}

.status-ok {
    background: #d4edda;
    color: #155724;
    border: 1px solid #c3e6cb;
}

.status-warning {
    background: #fff3cd;
    color: #856404;
    border: 1px solid #ffeaa7;
}

.status-error {
    background: #f8d7da;
    color: #721c24;
    border: 1px solid #f5c6cb;
}

/* Media Queries */
@media (max-width: 1024px) {
    .main-content {
        grid-template-columns: 1fr;
    }
    .summary-panel {
        position: static;
        margin-top: 30px;
    }
}

@media (max-width: 768px) {
    body {
        padding: 10px;
    }
    .header h1 {
        font-size: 2rem;
    }
    .main-content {
        padding: 15px;
    }
    .form-section, .summary-panel {
        padding: 20px;
    }
    .grid-cols-1.md\:grid-cols-2 {
        grid-template-columns: 1fr;
    }
}
