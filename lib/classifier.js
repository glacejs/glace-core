"use strict";

/**
 * Wrapper on bayes classifier.
 *
 * @module
 */

var bayes = require("bayes");

module.exports = () => {

    var classifier = bayes();
    classifier.isTrained = false;

    classifier.train = function () {
        this.isTrained = true;
    };

    classifier.getClassifications = function (text) {
        var tokens = this.tokenizer(text);
        var frequencyTable = this.frequencyTable(tokens);

        var result = [];
        for (var category in this.categories) {

            var item = { label: category, value: 0 };
            result.push(item);

            for (var [token, frequency] of Object.entries(frequencyTable)) {
                var tokenProbability = this.tokenProbability(token, category);
                item.value += frequency * tokenProbability;
            };
        };

        result.sort((a, b) => b.value - a.value);
        return result;
    };

    return classifier;
};
