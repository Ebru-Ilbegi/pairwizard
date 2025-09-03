document.addEventListener("DOMContentLoaded", () => {
    const generateBtn = document.querySelector(".container button");
    const copyBtn = document.querySelector(".container2 button");
    const inputArea = document.querySelector(".container textarea");
    const outputArea = document.getElementById("output");

    generateBtn.addEventListener("click", () => {
        const inputText = inputArea.value.trim();
        if (!inputText) {
            Swal.fire({
                icon: "warning",
                title: "Please enter parameters!",
                text: "Example format: Param1 = A, B; Param2 = X, Y"
            });
            return;
        }

        try {
            const parameters = parseParameters(inputText);
            const combinations = generatePairwiseCombinations(parameters);
            
            const paramNames = Object.keys(parameters);
            let output = paramNames.join("\t") + "\n";
            output += combinations.map(comb => comb.join("\t")).join("\n");
            
            outputArea.value = output;
            
            Swal.fire({
                icon: "success",
                title: "Combinations generated!",
                text: `Created ${combinations.length} pairwise test cases`
            });
        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "Error generating combinations",
                text: error.message
            });
            console.error(error);
        }
    });

    copyBtn.addEventListener("click", () => {
        if (!outputArea.value) {
            Swal.fire({
                icon: "warning",
                title: "Nothing to copy!",
                text: "Please generate combinations first"
            });
            return;
        }
        
        navigator.clipboard.writeText(outputArea.value)
            .then(() => {
                Swal.fire({
                    icon: "success",
                    title: "Copied!",
                    text: "Combinations copied to clipboard"
                });
            })
            .catch(err => {
                Swal.fire({
                    icon: "error",
                    title: "Copy failed",
                    text: err.message
                });
            });
    });

    function parseParameters(input) {
        const parameterLines = input.split(';').filter(line => line.trim());
        const parameters = {};
        
        for (const line of parameterLines) {
            const [name, valuesStr] = line.split('=').map(part => part.trim());
            if (!name || !valuesStr) continue;
            
            const values = valuesStr.split(',').map(val => val.trim()).filter(val => val);
            parameters[name] = values;
        }
        
        if (Object.keys(parameters).length < 2) {
            throw new Error("At least 2 parameters are required");
        }
        
        return parameters;
    }

    function generatePairwiseCombinations(parameters) {
        const paramNames = Object.keys(parameters);
        const paramValues = paramNames.map(name => parameters[name]);
        
        const pairs = [];
        for (let i = 0; i < paramNames.length; i++) {
            for (let j = i + 1; j < paramNames.length; j++) {
                pairs.push([i, j]);
            }
        }
        
        const coveredPairs = new Set();
        const testCases = [];
        
        const allPairsToCover = [];
        pairs.forEach(([i, j]) => {
            parameters[paramNames[i]].forEach(val1 => {
                parameters[paramNames[j]].forEach(val2 => {
                    allPairsToCover.push(`${i},${val1}|${j},${val2}`);
                });
            });
        });
        
        while (coveredPairs.size < allPairsToCover.length) {
            let bestTestCase = null;
            let maxNewPairs = 0;
            
            for (let attempt = 0; attempt < 100; attempt++) {
                const testCase = paramNames.map((_, idx) => {
                    const values = parameters[paramNames[idx]];
                    return values[Math.floor(Math.random() * values.length)];
                });
                
                let newPairs = 0;
                pairs.forEach(([i, j]) => {
                    const pair = `${i},${testCase[i]}|${j},${testCase[j]}`;
                    if (!coveredPairs.has(pair)) newPairs++;
                });
                
                if (newPairs > maxNewPairs) {
                    maxNewPairs = newPairs;
                    bestTestCase = testCase;
                    if (maxNewPairs === pairs.length) break; // Found optimal case
                }
            }
            
            if (!bestTestCase) break;
            
            testCases.push(bestTestCase);
            pairs.forEach(([i, j]) => {
                const pair = `${i},${bestTestCase[i]}|${j},${bestTestCase[j]}`;
                coveredPairs.add(pair);
            });
        }
        
        return testCases;
    }
});