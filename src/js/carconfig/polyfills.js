var isIE = navigator.appName === 'Microsoft Internet Explorer' ? true : false;
/*
    Developed by Robert Nyman, http://www.robertnyman.com
    Code/licensing: http://code.google.com/p/getelementsbyclassname/
*/
var getElementsByClassName = function (className, tag, elm){
    if (document.getElementsByClassName) {
        getElementsByClassName = function (className, tag, elm) {
            elm = elm || document;
            var elements = elm.getElementsByClassName(className),
                nodeName = (tag)? new RegExp("\\b" + tag + "\\b", "i") : null,
                returnElements = [],
                current;
            for(var i=0, il=elements.length; i<il; i+=1){
                current = elements[i];
                if(!nodeName || nodeName.test(current.nodeName)) {
                    returnElements.push(current);
                }
            }
            return returnElements;
        };
    }
    else if (document.evaluate) {
        getElementsByClassName = function (className, tag, elm) {
            tag = tag || "*";
            elm = elm || document;
            var classes = className.split(" "),
                classesToCheck = "",
                xhtmlNamespace = "http://www.w3.org/1999/xhtml",
                namespaceResolver = (document.documentElement.namespaceURI === xhtmlNamespace)? xhtmlNamespace : null,
                returnElements = [],
                elements,
                node;
            for(var j=0, jl=classes.length; j<jl; j+=1){
                classesToCheck += "[contains(concat(' ', @class, ' '), ' " + classes[j] + " ')]";
            }
            try {
                elements = document.evaluate(".//" + tag + classesToCheck, elm, namespaceResolver, 0, null);
            }
            catch (e) {
                elements = document.evaluate(".//" + tag + classesToCheck, elm, null, 0, null);
            }
            while ((node = elements.iterateNext())) {
                returnElements.push(node);
            }
            return returnElements;
        };
    }
    else {
        getElementsByClassName = function (className, tag, elm) {
            tag = tag || "*";
            elm = elm || document;
            var classes = className.split(" "),
                classesToCheck = [],
                elements = (tag === "*" && elm.all)? elm.all : elm.getElementsByTagName(tag),
                current,
                returnElements = [],
                match;
            for(var k=0, kl=classes.length; k<kl; k+=1){
                classesToCheck.push(new RegExp("(^|\\s)" + classes[k] + "(\\s|$)"));
            }
            for(var l=0, ll=elements.length; l<ll; l+=1){
                current = elements[l];
                match = false;
                for(var m=0, ml=classesToCheck.length; m<ml; m+=1){
                    match = classesToCheck[m].test(current.className);
                    if (!match) {
                        break;
                    }
                }
                if (match) {
                    returnElements.push(current);
                }
            }
            return returnElements;
        };
    }
    return getElementsByClassName(className, tag, elm);
};


/* This function makes a div scrollable with android and iphone */

function isTouchDevice(){
    /* Added Android 3.0 honeycomb detection because touchscroll.js breaks
        the built in div scrolling of android 3.0 mobile safari browser */
    if((navigator.userAgent.match(/android 3/i)) ||
        (navigator.userAgent.match(/honeycomb/i)))
        return false;
    try{
        document.createEvent("TouchEvent");
        return true;
    }catch(e){
        return false;
    }
}

_.mixin({
    currency: function(value) {
        if (value < 0) {
            value *= -1;
            return '($' + _.formatNumber(value) + ')';
        }
        return '$' + _.formatNumber(value);
    },
    formatNumber: function(value) {
        return (Number(value) || 0).toString().split(/(?=(?:\d{3})+(?:\.|$))/g).join(',');
    },
    rgb2hex: function(obj) {
        function hex(value) {
            return Number(value).toString(16).replace(/^(.)$/,'0$1');
        }
        return '#' + hex(obj.r) + hex(obj.g) + hex(obj.b);
    }
});