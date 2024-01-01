class DeckGateway {
    static async getall() {
        var data;
        var success;
        fetch("../main/deck/deck_getall.php", {
            method: 'get'
        }).then(function(res) {
            if(!res.ok) {
                console.log("backend: getall() received an improper response when fetching decks.");
                throw new Error("none");
            }
            return res.json();
        }).then(function(res) {
            success = (res.status == "success");
            if(!success) {
                data = res.reason;
            } else {
                data = JSON.parse(res.data);
            }
        }).catch(function(err) {
            if(err === "Error: none") {
                return;
            }
            console.log("backend: " + err);
        });
        return [success, data];
    }
}