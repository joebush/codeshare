var myCodeMirror;
$(document).ready(function() {
    myCodeMirror = CodeMirror.fromTextArea(document.getElementById("code_entry"), {
        theme: "rubyblue",
        lineNumbers: true
    });
});