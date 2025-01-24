/* Weighted Decision tree :
 *
 * 1. sampleWeights: features weight on a per sample basis
 * 2. featureWeights: global weight per features applied to all samples 
 *

 // Example: featureWeights structure for each sample
  const X = [
    { feature1: 0.5, feature2: 0.7 },
    { feature1: 0.8, feature2: 0.4 }
  ];
  const featureWeights = [
    { feature1: 0.9, feature2: 0.1 },
    { feature1: 0.5, feature2: 0.7 }
  ];

 */
class DecisionTree {
  constructor(minSamplesSplit = 2, maxDepth = 10, defaultLeafPrediction = 'n/a', featureWeights = {}) {
    this.minSamplesSplit = minSamplesSplit;
    this.maxDepth = maxDepth;
    this.defaultLeafPrediction = defaultLeafPrediction;
    this.featureWeights = featureWeights; // Dictionary of feature weights
    //this.featureWeights = X.map(features => calculateFeatureWeights(features));
    this.tree = null;
  }

  trainWithoutWeight(X, y) {
    console.debug("Fitting tree with data:", X.map((item,index) => ({...item, label: y[index]})));
    const  sampleWeights = Array(y.length).fill(1);
    this.tree = this._growTree(X, y, sampleWeights, 0);
  }

  train(X, y, sampleWeights = null) {
    if (!sampleWeights) {
      // Default to equal weights if none are provided
      sampleWeights = Array(y.length).fill(1);
    }
    this.tree = this._growTree(X, y, sampleWeights, 0);
  }

  _growTree(X, y, sampleWeights, depth) {
    console.debug({X, y, sampleWeights});
    if (!X || !y || X.length === 0 || y.length === 0) {
      return this._createLeaf(y,sampleWeights);
    }

    const nSamples = y.length;

    if (nSamples < this.minSamplesSplit || depth >= this.maxDepth) {
      return this._createLeaf(y,sampleWeights);
    }

    const { bestFeature, bestThreshold, bestGain } = this._findBestSplit(X, y, sampleWeights);

    if (!bestFeature) {
      return this._createLeaf(y,sampleWeights);
    }

    const { leftX, leftY, leftWeights, rightX, rightY, rightWeights } = this._splitData(
      X, y, sampleWeights, bestFeature, bestThreshold
    );

    if (leftX.length === 0 || rightX.length === 0) {
      return this._createLeaf(y,sampleWeights);
    }

    const left = this._growTree(leftX, leftY, leftWeights, depth + 1);
    const right = this._growTree(rightX, rightY, rightWeights, depth + 1);

    return { feature: bestFeature, threshold: bestThreshold, left, right, samples: y };
  }




  _findBestSplit(X, y, weights) {
    let bestGain = -1;
    let bestFeature = null;
    let bestThreshold = null;

    for (const feature of Object.keys(X[0])) {
      if (typeof X[0][feature] === 'boolean') {
        const gain = this._calculateGainForBooleanSplit(X, y, feature, weights);
        if (gain > bestGain) {
          bestGain = gain;
          bestFeature = feature;
          bestThreshold = true;
        }
      } else if (typeof X[0][feature] === 'string') { /* with negative test support */
        const uniqueValues = [...new Set(X.map(x => x[feature]))];
        for (const value of uniqueValues) {
          const gain = this._calculateGainForStringSplit(X, y, feature, weights, value);
          if (gain > bestGain) {
            bestGain = gain;
            bestFeature = feature;
            bestThreshold = value;
          }
        }
      } else {
        const values = X.map(x => x[feature]).filter(v => v !== undefined).sort((a, b) => a - b);
        for (let i = 0; i < values.length - 1; i++) {
          const threshold = (values[i] + values[i + 1]) / 2;
          const gain = this._calculateGain(X, y, feature, weights, threshold);
          if (gain > bestGain) {
            bestGain = gain;
            bestFeature = feature;
            bestThreshold = threshold;
          }
        }
      }
    }

    return { bestFeature, bestThreshold, bestGain };
  }

  _calculateGainForBooleanSplit(X, y, feature, weights) {
    const parentImpurity = this._gini(y, weights);
    let leftY = [], leftWeights = [], rightY = [], rightWeights = [];
    for (let i = 0; i < X.length; i++) {
      if (X[i][feature]) {
        leftY.push(y[i]);
        leftWeights.push(weights[i]);
      } else {
        rightY.push(y[i]);
        rightWeights.push(weights[i]);
      }
    }
    if (leftY.length === 0 || rightY.length === 0) {
      return -1;
    }

    const totalWeight = weights.reduce((a, b) => a + b, 0);
    const leftWeightSum = leftWeights.reduce((a, b) => a + b, 0);
    const rightWeightSum = rightWeights.reduce((a, b) => a + b, 0);

    const weightedImpurity = 
      (leftWeightSum / totalWeight) * this._gini(leftY, leftWeights) +
      (rightWeightSum / totalWeight) * this._gini(rightY, rightWeights);

    const gain = parentImpurity - weightedImpurity;
    // Apply the feature weight
    const globalWeight = this.featureWeights[feature] || 1;
    return gain * globalWeight;
  }

  _calculateGainForStringSplit(X, y, feature, weights, value) {
    const parentImpurity = this._gini(y, weights);
    let leftY = [], leftWeights = [], rightY = [], rightWeights = [];
    for (let i = 0; i < X.length; i++) {
      if (X[i][feature] === value) {
        leftY.push(y[i]);
        leftWeights.push(weights[i]);
      } else {
        rightY.push(y[i]);
        rightWeights.push(weights[i]);
      }
    }
    if (leftY.length === 0 || rightY.length === 0) {
      return -1;
    }
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    const leftWeightSum = leftWeights.reduce((a, b) => a + b, 0);
    const rightWeightSum = rightWeights.reduce((a, b) => a + b, 0);

    const weightedImpurity = 
      (leftWeightSum / totalWeight) * this._gini(leftY, leftWeights) +
      (rightWeightSum / totalWeight) * this._gini(rightY, rightWeights);

    const gain = parentImpurity - weightedImpurity;
    // Apply the feature weight
    const globalWeight = this.featureWeights[feature] || 1;
    return gain * globalWeight;

  }

  _calculateGain(X, y, feature, weights, threshold) {
    const parentImpurity = this._gini(y, weights);
    let leftY = [], leftWeights = [], rightY = [], rightWeights = [];
    for (let i = 0; i < X.length; i++) {
      if (X[i][feature] <= threshold) {
        leftY.push(y[i]);
        leftWeights.push(weights[i]);
      } else {
        rightY.push(y[i]);
        rightWeights.push(weights[i]);
      }
    }
    if (leftY.length === 0 || rightY.length === 0) {
      return -1;
    }
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    const leftWeightSum = leftWeights.reduce((a, b) => a + b, 0);
    const rightWeightSum = rightWeights.reduce((a, b) => a + b, 0);

    const weightedImpurity = 
      (leftWeightSum / totalWeight) * this._gini(leftY, leftWeights) +
      (rightWeightSum / totalWeight) * this._gini(rightY, rightWeights);

    const gain = parentImpurity - weightedImpurity;
    // Apply the feature weight
    const globalWeight = this.featureWeights[feature] || 1;
    return gain * globalWeight;

  }

  _gini(y, weights) {
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    const classCount = y.reduce((acc, label, idx) => {
      acc[label] = (acc[label] || 0) + weights[idx];
      return acc;
    }, {});

    let gini = 1;
    for (const count of Object.values(classCount)) {
      const p = count / totalWeight;
      gini -= p * p;
    }
    return gini;
  }

  _splitData(X, y, sampleWeights, feature, threshold) {
    const leftX = [], leftY = [], leftWeights = [];
    const rightX = [], rightY = [], rightWeights = [];

    for (let i = 0; i < X.length; i++) {
      if (typeof X[i][feature] === 'boolean') {
        if (X[i][feature]) {
          leftX.push(X[i]);
          leftY.push(y[i]);
          leftWeights.push(sampleWeights[i]);
        } else {
          rightX.push(X[i]);
          rightY.push(y[i]);
          rightWeights.push(sampleWeights[i]);
        }
      } else if (typeof X[i][feature] === 'string') {
        if (X[i][feature] === threshold) {
          leftX.push(X[i]);
          leftY.push(y[i]);
          leftWeights.push(sampleWeights[i]);
        } else {
          rightX.push(X[i]);
          rightY.push(y[i]);
          rightWeights.push(sampleWeights[i]);
        }
      } else {
        if (X[i][feature] <= threshold) {
          leftX.push(X[i]);
          leftY.push(y[i]);
          leftWeights.push(sampleWeights[i]);
        } else {
          rightX.push(X[i]);
          rightY.push(y[i]);
          rightWeights.push(sampleWeights[i]);
        }
      }
    }

    return { leftX, leftY, leftWeights, rightX, rightY, rightWeights };
  }


  _createLeaf(y, weights) {
    if (y.length === 0) {
      console.debug(`Created default leaf node with prediction: ${this.defaultLeafPrediction}`);
      return { prediction: this.defaultLeafPrediction };
    }
    const classCount = y.reduce((acc, label, idx) => {
      acc[label] = (acc[label] || 0) + weights[idx];
      return acc;
    }, {});
    const prediction = Object.keys(classCount).reduce((a, b) => 
    classCount[a] > classCount[b] ? a : b
  );
    return { prediction, samples: y };
  }

  predict(x) {
    let node = this.tree;
    while (!node.prediction) {
      if (typeof x[node.feature] === 'boolean') {
        if (x[node.feature]) {
          node = node.left;
        } else {
          node = node.right;
        }
      } else if (typeof x[node.feature] === 'string') {
        if (x[node.feature] === node.threshold) {
          node = node.left;
        } else {
          node = node.right;
        }
      } else {
        if (x[node.feature] <= node.threshold) {
          node = node.left;
        } else {
          node = node.right;
        }
      }
    }
    return node.prediction;
  }

  toDot() {
    if (!this.tree) return "digraph G {}";
    let dotContent = "digraph DecisionTree {\n";
    dotContent += " node [shape=box];\n";

    const addNodeToDot = (node, nodeId) => {
      if (node.prediction !== undefined) {
        const color = node.prediction === this.defaultLeafPrediction ? "red" : "black";
        dotContent += ` ${nodeId} [label="${node.prediction}", shape=ellipse, fontcolor=${color}];\n`;
      } else {
        const featureLabel = node.feature.replace(/([A-Z])/g, ' $1').trim();
        if (typeof node.threshold === 'boolean') {
          dotContent += ` ${nodeId} [label="${featureLabel} is True"];\n`;
          dotContent += ` ${nodeId} -> ${nodeId}0 [label="True"];\n`;
          dotContent += ` ${nodeId} -> ${nodeId}1 [label="False"];\n`;
        } else if (typeof node.threshold === 'string') {
          dotContent += ` ${nodeId} [label="${featureLabel} == '${node.threshold}'"];\n`;
          dotContent += ` ${nodeId} -> ${nodeId}0 [label="=="];\n`;
          dotContent += ` ${nodeId} -> ${nodeId}1 [label="!="];\n`;
        } else {
          dotContent += ` ${nodeId} [label="${featureLabel} <= ${node.threshold.toFixed(2)}"];\n`;
          dotContent += ` ${nodeId} -> ${nodeId}0 [label="<="];\n`;
          dotContent += ` ${nodeId} -> ${nodeId}1 [label=">"];\n`;
        }
        addNodeToDot(node.left, `${nodeId}0`);
        addNodeToDot(node.right, `${nodeId}1`);
      }
    };

    addNodeToDot(this.tree, 'node0');
    dotContent += '}';
    return dotContent;
  }

  prune() {
    this.tree = this._pruneNode(this.tree);
  }

  _pruneNode(node) {
    if (node.prediction !== undefined) {
      return node;
    }
    node.left = this._pruneNode(node.left);
    node.right = this._pruneNode(node.right);
    if (node.left.prediction !== undefined && node.right.prediction !== undefined) {
      if (node.left.prediction === node.right.prediction) {
        return { prediction: node.left.prediction };
      }
    }
    return node;
  }
}

// Export the class for use in other scripts
export default DecisionTree;

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = DecisionTree;
} else {
  window.DecisionTree = DecisionTree;
}

