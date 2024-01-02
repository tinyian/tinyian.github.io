$(document).ready(function(){
    selectPage();
    
    function selectPage() {
        $("#tokenSection").hide();
        $("#refSection").hide();
        $("#deviceSection").show();

        $("#backEnd").click(function(){
            $("#tokenSection").show();
            $("#refSection").show();
            $("#closeToken").show();
        });
        
        $("#closeToken").click(function(){
            $("#tokenSection").hide();
            $("#refSection").hide();
            $("#closeToken").hide();
        });
    }
});
