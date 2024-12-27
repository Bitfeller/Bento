// These are the archives that hold some of the most random or deprecated segments of code.
// (basically, I was lazy)
// - Bitfeller

function set_formatter(div) {
    let save = div.innerHTML;
    div.addEventListener('focusout', (e) => {
        save = div.innerHTML;
        div.innerHTML = div.innerHTML.replaceAll(/\$\$[^$]*\$\$/g, "<b style='color: rgb(255, 100, 100);'>[paragraph equation rendering is disabled]<b>");
        typeset(div);
    });
    div.addEventListener('focus', (e) => {
        div.innerHTML = save;
    })
    // div.addEventListener('keydown', (e) => {
    //     const sel = window.getSelection();
    //     const range = sel.getRangeAt(0);
    //     let [currNode, currOffset] = [range.endContainer, range.endOffset];
    //     let parentNode = currNode.nodeType == Node.TEXT_NODE ? currNode.parentNode : currNode;
    //     if(e.ctrlKey) {
    //         switch(e.key) {
    //             case '.':
    //             case '^':
    //                 e.preventDefault();
    //                 if(parentNode.tagName == 'SUB' || parentNode.tagName == 'SUP') {
    //                     let content = parentNode.innerHTML.slice(currOffset);
    //                     if(content.length == 0) content = "\u200B";
    //                     parentNode.innerHTML = parentNode.innerHTML.slice(0, currOffset);
    //                     parentNode.after(content);
    //                     let content_idx = Array(...div.childNodes).indexOf(parentNode) + 1;
    //                     range.setStart(div, content_idx + (content == "\u200B" ? 1 : 0));
    //                     range.collapse(true);
    //                     return;
    //                 }
    //                 let sub = document.createElement(e.key == '.' ? 'sub' : 'sup');
    //                 if(range.toString().length > 0) {
    //                     range.surroundContents(sub);
    //                     range.setStart(sub, 0);
    //                     range.collapse(true);
    //                     sel.removeAllRanges();
    //                     sel.addRange(range);
    //                 } else {
    //                     sub.innerHTML = "\u200B";
    //                     currNode.after(sub);
    //                     range.setEnd(div, div.childNodes.length);
    //                     range.setStart(div, div.childNodes.length);
    //                 }
    //             break;
    //         }
    //     }
    //     if(e.key == "ArrowRight") {
    //         const sel = window.getSelection();
    //         const range = sel.getRangeAt(0);
    //         if((parentNode.tagName == "SUB" || parentNode.tagName == "SUP") && currOffset == currNode.textContent.length) {
    //             e.preventDefault();
    //             if(parentNode.nextSibling) {
    //                 range.setStart(parentNode.nextSibling, 0);
    //                 range.collapse(true);
    //                 sel.removeAllRanges();
    //                 sel.addRange(range);
    //             } else {
    //                 div.innerHTML += "\u200B";
    //                 range.setStart(div, div.childNodes.length);
    //                 range.collapse(true);
    //             }
    //         }
    //     }
    // })
}