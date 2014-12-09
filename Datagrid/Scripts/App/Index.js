define(function (require) {
    //Define the columns for your gridview
    //These will be used by the GlobalEntityRepeater
    var columns = [
    {
        label: 'First Name', //Column Heading
        property: 'FirstNames', //Model Property name
        sortable: true //Is this field sortable
    },
    {
        label: 'Surname',
        property: 'Surname',
        sortable: true
    },
    {
        label: 'Government ID',
        property: 'GovID',
        sortable: true
    },
    {
        label: 'Gender',
        property: 'Gender',
        sortable: true
    },
    {
        label: 'LUCEthnicity',
        property: 'LUCEthnicity',
        sortable: true
    },
    {
        label: 'Account Locked Out',
        property: 'IsLockedOut',
        format: 'b', //Should formatting be applied to this content
        sortable: true
    },
    {
        label: 'InsertedOn',
        property: 'InsertedOn',
        format: 'd',
        sortable: true
    },
        {
            label: 'Edit',
            sortable: false,
            html: '<button class="btn btn-primary editBtn" title="Click here to edit this record" data-GlobalEntityID="{GlobalEntityID}" data-GovID="{GovID}">Edit me</button>'
            //All properties wrapped in {} will bind the relevant property from the Model to the Datagrid e.g. {GlobalEntityID} will bind the content from the 
            //GlobalEntityID property to the above control.
        },
        {
            label: 'Dropdown',
            sortable: false,
            html: '<select class="dropManage" data-GlobalEntityID="{GlobalEntityID}"></select>' //Custom HTML to be used for the button.
        }
    ];

    //Formatting options:
    //b = Boolean value that will display No for 0, Yes for 1
    //d = Date formatting will apply date MMMM YYYY h:mm a formatting
    //n = Money formatting, will prepend with R 
    //email = Email formatting will convert content to email link
    //a = Anchor tag formatting will convert content to link
    //json = Will convert JSON array into a table.

    var createDatagrid = require('createdatagrid');
    var options =
    {
        columns: columns,
        gridID: 'GlobalEntityRepeater'
    }

    //Get some data from the WebAPI controller
    $.getJSON("/api/GlobalEntity/", function (data) {
        createDatagrid.Init(options, data);
        createDatagrid.Load();

        //This event is fired from the Repeater when the rendering of the Repeater is complete
        //This fires each time the repeater is paged/sorted/rebound.
        $(document).on("repeaterRenderComplete", repeaterRenderCompleteHandler);
    });
    //This method is called when the Datagrid has completed being rendered
    function repeaterRenderCompleteHandler(e) {
        bindDropDowns();
        var gridId = e.gridID;

        //This is the ID of the repeater passed back from the event.
        $("#GridMsg").html("The repeater #" + gridId + " has rendered completely.");
        $("#AlertMsg").fadeIn();
    }

    //Bind the data to each of the dropmanager drop downs
    function bindDropDowns() {
        addEditEvent();
        $(".dropManage").each(function () {
            var dropManager = $(this);
            var globalEntityId = dropManager.attr('data-GlobalEntityID');
            $.getJSON("/api/Policy/GetPolicy?GlobalEntityID=" + globalEntityId, function (result) {
                dropManager.empty();
                dropManager.append($("<option></option>").val("Please select").html("Please select"));

                $.each(result, function () {
                    var res = this;
                    dropManager.append($("<option></option>").val(res.LUCPolicyStatus).html(res.PolicyNo));
                    dropManager.change(function () {
                        var policyNo = $("option:selected", this).text();

                        if (policyNo !== "Please select") {
                            loadPolicy(globalEntityId, policyNo);
                        } else {
                            $("#GridMsg").html("Please select a Policy No to view.");
                        }
                    });
                });
            });
        });
    }

    var $PolicyRepeaterContainer = $("#PolicyRepeaterContainer");

    //Load the second Datagrid using the values from the Dropmanager dropdown in the GlobalEntity Datagrid
    function loadPolicy(globalEntityId, policyNo) {
        $PolicyRepeaterContainer.html("");
        $PolicyRepeaterContainer.load("/Shared/Datagrid", { GridID: "PolicyRepeater", GridTitle: "Policy Grid" },
            function () {
                //Get some Policy data from the WebAPI controller that matches the GlboalEntityID & PolicyNo stored in the dropManager drop down.
                $.getJSON("/api/Policy?PolicyNo=" + policyNo + "&GlobalEntityID=" + globalEntityId, function (data2) {
                    //Define the columns for your gridview
                    var columnsPolicy = [
                    {
                        label: 'Policy No',
                        property: 'PolicyNo',
                        sortable: true
                    },
                    {
                        label: 'Bouquet Prefix',
                        property: 'BouquetPrefix',
                        sortable: true
                    },
                    {
                        label: 'Status',
                        property: 'LUCPolicyStatus',
                        sortable: true
                    },
                    {
                        label: 'InsertedOn',
                        property: 'InsertedOn',
                        format: 'd',
                        sortable: true
                    }];

                    var options2 =
                    {
                        columns: columnsPolicy,
                        gridID: 'PolicyRepeater'
                    }

                    createDatagrid.Init(options2, data2);
                    createDatagrid.Load();
                });
            }
        );
    }

    //The modal window below is really there to illustrate a point, and  is not necesary for the solution at all.
    //Modal Events
    var $ModalContentContainer = $("#ModalContentContainer");
    var $myModal = $("#myModal");
    var $myModalLabel = $("#myModalLabel");

    function addEditEvent() {
        $(".editBtn").click(function () {
            var $editBtn = $(this);
            var globalentityId = $editBtn.attr("data-GlobalEntityID");

            $.get("/GlobalEntity/Edit/" + globalentityId, function (result) {
                $ModalContentContainer.html(result);
                $myModal.modal('show');
                $myModalLabel.html("Edit this GlobalEntity record");

                $myModal.on('hidden.bs.modal', function () {
                    $("#GridMsg").html("The Modal closed. This would be your refresh function on your datagrid.");
                    $("#AlertMsg").fadeIn();
                });
            });
        });
    }
});