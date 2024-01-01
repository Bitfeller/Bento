// To be integrated into game.js
// Description: A ranking system for ranking problems.

var elements = [
    document.getElementById("item1"),
    document.getElementById("item2"),
    document.getElementById("item3"),
    document.getElementById("item4")
];
var centroids = [];
var list = document.getElementById("sorting");
var dragging;
var dragLine = document.createElement("div");
dragLine.style = "display: flex; background-color: rgb(0, 150, 255); width: 100px; height: 1px;";


function computeCenter(el) {
    var rect = el.getBoundingClientRect()
    return {
        x: (rect.left + rect.right) / 2 + window.scrollX,
        y: (rect.top + rect.bottom) / 2 + window.scrollY
    }
}

for(var i = 0; i < elements.length; i++) {
    elements[i].addEventListener("dragstart", function(e) {
        dragging = this;
        e.target.style["background-color"] = "rgb(150, 100, 255)";
        list.prepend(dragLine);
    });
    elements[i].addEventListener("dragend", function(e) {
        e.target.style["background-color"] = "";
        dragLine.remove();
        var top;
        var bottom;
        var y = e.clientY;
        for(var i = 0; i < elements.length; i++) {
            if(centroids[i].y < y) {
                continue;
            } else if((i - 1) >= 0) {
                top = elements[i-1];
                bottom = elements[i];
                list.insertBefore(this, bottom);
                break;
            } else {
                top = elements[i];
                this.remove();
                list.prepend(this);
                break;
            }
        }
        if(!top) {
            e.target.remove();
            list.appendChild(e.target);
        }
        if(dragging === this) {
            dragging = undefined;
        }
        elements.sort((a, b) => {
            var centerA = computeCenter(a);
            var centerB = computeCenter(b);
            return centerA.y - centerB.y;
        });
        centroids = [];
        elements.forEach(function(val) {
            centroids.push(computeCenter(val));
        });
    });
    centroids.push(computeCenter(elements[i]));
}
window.addEventListener("dragover", function(e) {
    if(!dragging) {return;}
    var top;
    var bottom;
    var y = e.clientY;
    for(var i = 0; i < elements.length; i++) {
        if(centroids[i].y < y) {
            continue;
        } else if(i - 1 >= 0) {
            top = elements[i-1];
            bottom = elements[i];
            list.insertBefore(dragLine, bottom);
            break;
        } else {
            top = elements[i];
            dragLine.remove();
            list.prepend(dragLine);
            break;
        }
    }
    if(!top) {
        dragLine.remove();
        list.appendChild(dragLine);
    }
})