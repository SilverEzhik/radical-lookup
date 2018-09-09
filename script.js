// clear javascript warning and show the ui
{
    var el = document.getElementById("js-error");
    el.parentNode.removeChild(el);
    document.getElementById("tool").style.display = '';
}
var krad;
{
    var re_krad = /(.) : (.*)/;
    var request_krad = new XMLHttpRequest();
    request_krad.open('GET', "kradzip/kradfile", true);
    request_krad.send(null);
    request_krad.onreadystatechange = function () {
        if (request_krad.readyState === 4 && request_krad.status === 200) {
            var type = request_krad.getResponseHeader('Content-Type');
            if (type.indexOf("text") !== 1) {
                var lines = request_krad.responseText.split("\n");
                krad = new Map;
                lines.forEach(e => {
                    var split = re_krad.exec(e);
                    if (split != null && split[1] != "#") {
                        krad.set(split[1], split[2].split(" "));
                    }
                });
            }
        }
    }
}

var radk;
{
    var re_radk = /^\$ (.)/; // radk regex
    var request_radk = new XMLHttpRequest();
    request_radk.open('GET', "kradzip/radkfile", true);
    request_radk.send(null);
    request_radk.onreadystatechange = function () {
        if (request_radk.readyState === 4 && request_radk.status === 200) {
            var type = request_radk.getResponseHeader('Content-Type');
            if (type.indexOf("text") !== 1) {
                var lines = request_radk.responseText.split("\n");
                radk = new Map;
                var cur = "";
                lines.forEach(e => {
                    var split = re_radk.exec(e);
                    if (split != null) {
                        cur = split[1];
                        radk.set(cur, []);
                    } else {
                        if (e.charAt(0) != "#") {
                            radk.set(cur, radk.get(cur).concat(e.split("")));
                        }
                    }
                });
            }
        }
    }
}

function clearInput() {
    let input = document.getElementById("input");
    input.value = "";
    input.focus();
}

let radical_list = document.getElementById("radical-list");
function getRadicals(textbox) {
    radical_list.innerHTML = "";
    let radicals = krad.get(textbox.value);
    if (radicals == undefined) {
        radical_list.innerHTML = "無";
    } else {
        radicals.forEach(e => {
            radical_list.innerHTML += ("<a onclick=\"addRadical(this)\">" + e + "</a> ");
        });
    }
}

function addRadical(btn) {
    selected_radicals.add(btn.innerText);                 
}

var selected_radicals = {};
selected_radicals.div = document.getElementById("selected-radicals-list");
selected_radicals.list = [];
selected_radicals.marked = null;

selected_radicals.add = function(r) {
    if (this.list.includes(r)) {
        return;
    }
    
    this.list.push(r);
    this.div.innerHTML += ("<a onclick=\"removeRadical(this)\">" + r + "</a> ");
    updateKanji();
}
selected_radicals.remove = function(r) {
    if (!this.list.includes(r)) {
        return;
    }
    selected_radicals.div.childNodes.forEach(e => {
        // if clicked on the marked button, delete
        if (e == this.marked && e.innerText == r) {
            this.list.splice(this.list.indexOf(r), 1);
            this.div.removeChild(e);
            marked = null;
            updateKanji();
        // else, mark this one
        } else if (e.innerText == r) {
            if (this.marked != null) {
                this.marked.id = "";
            }
            this.marked = e;
            e.id = "marked";
        } else {
            e.id = "";
        }
    });
}

function removeRadical(btn) {
    selected_radicals.remove(btn.innerText);
}

var kanji_list = document.getElementById("kanji-list");
function updateKanji() {
    kanji_list.innerHTML = "";
    if (selected_radicals.list.length == 0) {
        return;
    }

    var kanji = radk.get(selected_radicals.list[0]).slice();
    for (var i = 1; i < selected_radicals.list.length; i++) {
        kanji = kanji.filter(function(n) {
            return radk.get(selected_radicals.list[i]).indexOf(n) > -1;
        });
    }
    kanji.forEach(e => {
        kanji_list.innerHTML += ("<a onclick=\"addKanji(this)\">" + e + "</a> ");
    });
}

var output = document.getElementById("output");
function addKanji(btn) {
    output.value += btn.innerText;
}

function openJisho() {
    if (output.value != "") {
        window.open("https://jisho.org/search/" + output.value, "_blank");
    }
    return false;
}
