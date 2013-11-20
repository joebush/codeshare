$(document).ready(function() {
    var myCodeMirror = CodeMirror.fromTextArea(document.getElementById("code_entry"), {
        theme: "rubyblue",
        lineNumbers: true
    });
});