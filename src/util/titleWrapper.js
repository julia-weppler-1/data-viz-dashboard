import * as d3 from 'd3';

export function wrap(text, width, isXAxis = false) {
    text.each(function () {
        const text = d3.select(this);
        const words = text.text().split(/\s+/).reverse();
        let word;
        let line = [];
        let lineNumber = 0;
        const lineHeight = 1.1; // ems
        const y = parseFloat(text.attr("y"));
        const dy = parseFloat(text.attr("dy") || 0);
        let tspan = text.text(null).append("tspan").attr("x", isXAxis ? width / 2 : -width / 2).attr("y", y).attr("dy", dy + "em");
        
        // Append the first word directly to the tspan element
        const firstWord = words.pop();
        line.push(firstWord);
        tspan.text(line.join(" "));
        
        while (word = words.pop()) {
            line.push(word);
            tspan.text(line.join(" "));
            const computedTextLength = tspan.node().getComputedTextLength();
            if (computedTextLength > width && line.length > 1) {
                line.pop();
                tspan.text(line.join(" "));
                line = [word];
                tspan = text.append("tspan").attr("x", isXAxis ? width / 2 : -width / 2 ).attr("y", y).attr("dy", `${++lineNumber * lineHeight + dy}em`).text(word);
            }
        }
    });
}




