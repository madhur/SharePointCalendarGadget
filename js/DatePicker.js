    "use strict";

     // Enable support of cross domain origin request
    jQuery.support.cors = true;

     // Disable caching of AJAX responses - Stop IE reusing cache data for the same requests
    $.ajaxSetup(
    {
    	cache: false
    });
	var urlVal="";
	
    var changeCalendarList = "";
   //"https://teams.aexp.com/sites/teamsitewendy/";
   // $().SPServices.defaults.webURL = "https://teams.aexp.com/sites/teamsitewendy/";
   
    var changeDateArr = new Array();
    var truncateLimit = 7;
    var gadgetHeight = '250px';
    var gadgetWidth = '250px';
    var expandedHeight;
    var globalCurrentMonth, globalCurrentYear;
	var filteredAppNames;
	var DefaultHeight = 275;
	var upcomingBarHeight=25;
	var rowHeight = 13;
	var flag =0 ;
	
    function IsGadget()
    {
    	return (window.System != undefined);
    }

    function init()
    {
    	if (IsGadget())
    	{
    		System.Gadget.settingsUI = "Settings.html";
    		System.Gadget.onDock = CheckDockState;
    		System.Gadget.onUndock = CheckDockState;
    		System.Gadget.Flyout.file = "flyout.html";
    		System.Gadget.Flyout.show = false;
		}
    }
	

    $(document).ready(function()
    {
    	$('#jqxcal').jqxCalendar(
    	{
    		width: gadgetHeight,
    		height: gadgetWidth,
    		theme: 'myTheme',
    		enableViews: false,
    		enableFastNavigation: false,
    		showOtherMonthDays: false
    	});

		refresh();
		
		$('#jqxcal').on('backButtonClick', function()
    	{
			var now = new Date();
    		globalCurrentMonth = globalCurrentMonth - 1;

    		if (globalCurrentMonth == -1)
    		{
    			globalCurrentMonth = 11;
    			globalCurrentYear = globalCurrentYear - 1;
    		}
    		if (globalCurrentMonth == 12)
    		{
    			globalCurrentMonth = 0;
    			globalCurrentYear = globalCurrentYear + 1;
    		}

    		var startDate = getminFormattedDate(globalCurrentMonth, globalCurrentYear)
    		var endDate = getmaxFormattedDate(globalCurrentMonth, globalCurrentYear)
    		var responseJSON = getCalendarDates(startDate, endDate);
		  		
			$("#cellTableViewjqxcal td").each(function()
    		{
    			if ($(this).css("visibility") == "hidden")
    			{}
    			else
    				doDateBindings(this, responseJSON);
    		});

    	});
		

    	$('#jqxcal').on('nextButtonClick', function()
    	{
			var now = new Date();
    		globalCurrentMonth = globalCurrentMonth + 1;

    		if (globalCurrentMonth == -1)
    		{
    			globalCurrentMonth = 11;
    			globalCurrentYear = globalCurrentYear - 1;
    		}
    		if (globalCurrentMonth == 12)
    		{
    			globalCurrentMonth = 0;
    			globalCurrentYear = globalCurrentYear + 1;
    		}

    		var startDate = getminFormattedDate(globalCurrentMonth, globalCurrentYear)
    		var endDate = getmaxFormattedDate(globalCurrentMonth, globalCurrentYear)			
    		var responseJSON = getCalendarDates(startDate, endDate);
			
    		$("#cellTableViewjqxcal td").each(function()
    		{
    			if ($(this).css("visibility") == "hidden")
    			{}
    			else
    				doDateBindings(this, responseJSON);

    		});
			
    	});
		
    });

    function getminFormattedDate(month, year)
    {
    	var minDate = new Date(year, month, 1);
    	minDate.setHours(minDate.getHours() + parseFloat(5));
    	minDate.setMinutes(minDate.getMinutes() + 30);
    	return minDate.toISOString().replace(".000", "");
    }

    function getmaxFormattedDate(month, year)
    {
    	var maxDate = new Date(year, month + 1, 0);
    	maxDate.setHours(maxDate.getHours() + parseFloat(5));
    	maxDate.setMinutes(maxDate.getMinutes() + 30);
    	return maxDate.toISOString().replace(".000", "");
    }

    function refresh()
    {
    	var now = new Date();
		var startDate, endDate;
		
		if(typeof globalCurrentMonth=="undefined")// || globalCurrentMonth=="" || globalCurrentMonth == null)
			globalCurrentMonth = now.getMonth();
		if(typeof globalCurrentYear=="undefined")// || globalCurrentY=="" || globalCurrentYear == null)	
			globalCurrentYear = now.getFullYear();


		if (IsGadget())
		{	
			urlVal = System.Gadget.Settings.readString("app");
			changeCalendarList = System.Gadget.Settings.readString("listname");

		}
		if(urlVal!="")
			$().SPServices.defaults.webURL = urlVal;
		else
			window.prompt("Click on settings and provide URL");	

		if(changeCalendarList!="")
			$().SPServices.defaults.listName = changeCalendarList;
		else
			window.prompt("Click on settings and provide List Name");
			
		var startDate = getminFormattedDate(globalCurrentMonth, globalCurrentYear)
    	var endDate = getmaxFormattedDate(globalCurrentMonth, globalCurrentYear)		
		var responseJSON = getCalendarDates(startDate, endDate);
		
	
		var startDate_upcoming = getminFormattedDate(now.getMonth(),now.getFullYear());	
		var endDate_upcoming = getmaxFormattedDate(now.getMonth(),now.getFullYear());	
		// var responseJSON_upcoming = getCalendarDates(startDate_upcoming, endDate_upcoming);
		
		var responseJSON_upcoming = getUpcomingChanges();
		//console.log("Response JSON Upcoming "+responseJSON_upcoming);
		
		nextFiveChanges(responseJSON_upcoming);			
    	
    	$("#cellTableViewjqxcal td").each(function()
    	{
    		if ($(this).css("visibility") == "hidden")
    		{
    			// console.log("hidden: "+$(this).text());
    		}
    		else
    		{
    			doDateBindings(this, responseJSON);
    		}
    	});
		
    }

    function doDateBindings(tdelem, responseJSON)
    {
    	$(tdelem).css(
    	{
    		'background': 'transparent',
    		'color': 'black',
    		'cursor': 'none'
    	});
    	$(tdelem).unbind('click mouseenter mouseleave');

    	$.each(responseJSON, function(i, cal)
    	{

    		EventDate_Arr = cal.EventDate.match(/^(\d+)-(\d+)-(\d+) (\d+)\:(\d+)\:(\d+)$/);
			
    		var tdText = $(tdelem).text();
    		if (tdText < 10)
    		{
    			tdText = "0" + tdText;
    		}
    		if (tdText === EventDate_Arr[3])
    		{
    			bindCalendarDate(tdelem, responseJSON);
    			return false;
    		}

    	});
    }

    function bindCalendarDate(elem, responseJSON)
    {
    	$(elem).css(
    	{
    		'background': '#F9C400',
    		'color': '#fff',
    		'cursor': 'pointer'
    	});

    	var tdonclick = function(ev)
    	{
    		ev.preventDefault();
    		onDateClickText = $(elem).text();

    		showFlyout(onDateClickText, responseJSON);

    		return false;
    	}

    	$(elem).bind('click', tdonclick);
    }

    function settingsHaveChanged()
    {
		flag=1;
    	refresh();
	}

    function showFlyout(onDateClickText, responseJSON)
    {
    	var tableContents = "";

        if (onDateClickText < 10)
        {
            onDateClickText = "0" + onDateClickText;
        }

        $.each(responseJSON, function(i, cal)
        {
            EventDate_Arr = cal.EventDate.match(/^(\d+)-(\d+)-(\d+) (\d+)\:(\d+)\:(\d+)$/);
            EndDate_Arr = cal.EndDate.match(/^(\d+)-(\d+)-(\d+) (\d+)\:(\d+)\:(\d+)$/);
			//appName = cal.AIM_x0020_Name.split(';#')[1];
            /*******    DISPLAY THE CLICKED DATE'S CHANGES ON FLYOUT        ******/
            if ((EventDate_Arr[3] == onDateClickText))
            {
					tableContents = tableContents +
                    "<tr class='flyoutrow'><td>" + cal.LinkTitle + "</td>" + "<td>" + cal.Location + "</td>" + "<td>" + EventDate_Arr[2]+"/"+EventDate_Arr[3]+"/"+EventDate_Arr[1].toString().substr(2,2) + "</td>" + "<td>"+ EndDate_Arr[2]+"/"+EndDate_Arr[3]+"/"+EndDate_Arr[1].toString().substr(2,2) +"</td>" + "</tr>";
					
            }
        });

        ActiveFlyout = tableContents;

    	if (IsGadget())
    	{
    		System.Gadget.Flyout.file = "flyout.html";
    		System.Gadget.Flyout.show = !System.Gadget.Flyout.show;
    		System.Gadget.Flyout.onShow = FlyoutLoaded;
    	}
    	else
    	{
    		myWin = window.open('flyout.html', '1384802697002', 'width=200,height=400,toolbar=0,menubar=0,location=0,status=0,scrollbars=0,resizable=1,left=0,top=0');

    		FlyoutLoaded(myWin);
    	}

    	return false;
    }


    function CheckDockState()
    {
    	if (System.Gadget.docked == true)
    	{
    		$('body').css(
    		{
    			"height": gadgetHeight
    		});
    	}
    	else
    	{
    		var height =
    			$('body').css(
    			{
    				"height": expandedHeight
    			});
    	}
    }

    function setBodyHeight(body, height)
    {

    	$(body).animate(
    	{
    		height: height
    	}, 0, function() {

    	});

    	$(body).css("overflow", "auto");
    }

   $("#upcomingdiv").css("overflow", "auto");
	
    function FlyoutLoaded(myWin)
    {
    	var approvedDOM = ActiveFlyout; 
    	var flyoutDOM;
    	var docDOM;
    	if (IsGadget())
    	{
    		flyoutDOM = System.Gadget.Flyout.document.getElementById('f_tblSPContent');
    		docDOM = System.Gadget.Flyout.document;
    	}
    	else
    	{
    		flyoutDOM = myWin.document.getElementById('f_tblSPContent');
    		docDOM = myWin.document;
    	}

    	if (flyoutDOM != null)
    	{
    		$(flyoutDOM).empty();
    		$(flyoutDOM).append(approvedDOM);
    	}

    	var size = $(flyoutDOM).find('tr').size();

    	var body = docDOM.body;
    	
    	//var height = 41+size * 13;
		var height = 41+size *20;
		
    	if (height > window.screen.availHeight)
    		height = window.screen.availHeight;

    	setBodyHeight(body, height);

    }

	function nextFiveChanges(responseJSON_upcoming)
    {
    	$('#tblSPContent').empty();
	
		var upcomingContents="";
    	var count = 0; var currDate; var j=0; var flag=0;
			
    	$.each(responseJSON_upcoming, function(i, cal)
    	{
			//console.log(cal.EventDate+"   "+cal.LinkTitle+"   "+cal.LOB);
			EventDate_Arr = cal.EventDate.match(/^(\d+)-(\d+)-(\d+) (\d+)\:(\d+)\:(\d+)$/);
    		EndDate_Arr = cal.EndDate.match(/^(\d+)-(\d+)-(\d+) (\d+)\:(\d+)\:(\d+)$/);
    		var EventDate_Formatted = new Date(EventDate_Arr[1], EventDate_Arr[2] - 1, EventDate_Arr[3], EventDate_Arr[4], EventDate_Arr[5], EventDate_Arr[6]);
		//	appName = cal.AIM_x0020_Name.split(';#')[1];				  
    	
			upcomingContents = 
						"<tr><td>" + cal.LinkTitle + "</td>" + "<td>" + cal.Location + "</td><td>" + EventDate_Arr[2]+"/"+EventDate_Arr[3]+"/"+EventDate_Arr[1].toString().substr(2,2) + "</td>" + "<td>"+EndDate_Arr[2]+"/"+EndDate_Arr[3]+"/"+EndDate_Arr[1].toString().substr(2,2)+"</td>" + "</tr>";
	
			count=count+1;				
			if(count<=5)
				$('#tblSPContent').append(upcomingContents);
    	});
			
		var rowCount = $("#tblSPContent").find('tr').size();
			expandedHeight = DefaultHeight+upcomingBarHeight+parseInt(rowCount*rowHeight);
			$('.title div').html("Upcoming Changes");
		
	}


    /*******  	GET THE DATA FROM SHAREPOINT 		******/
    function getCalendarDates(start, end)
    {
    	var responseJSON,myQuery;
		var functionStatus;
		// window.prompt("urlval = "+urlVal);
		myQuery = getfilteredQuery(start,end);
		// window.prompt("Query = "+myQuery);	
    	$().SPServices(
    	{
    		operation: "GetListItems",
    		async: false,
    		listName: changeCalendarList,
    		CAMLViewFields: "<ViewFields Properties='True'><FieldRef Name='LinkTitle' /><FieldRef Name='Location' /><FieldRef Name='EventDate' /><FieldRef Name='EndDate' /><FieldRef Name='fAllDayEvent'/></ViewFields>",
    		CAMLQuery: myQuery,
    		completefunc: function(xData, Status)
    		{
    			responseJSON = $(xData.responseXML).SPFilterNode("z:row").SPXmlToJson(
    			{
    				mapping:
    				{},
    				includeAllAttrs: true
    			});
    		}

    		/*****************************************************************/
    	});
		
    	return responseJSON;
    }
 
 
	function getUpcomingChanges()
    {
    	var responseUpcomingJSON,myUpcomingQuery;
		var functionStatus;
		var currDate = new Date();
		
		myUpcomingQuery = getUpcomingChangesQuery(currDate);
			
    	$().SPServices(
    	{
    		operation: "GetListItems",
    		async: false,
    		listName: changeCalendarList,
    		CAMLViewFields: "<ViewFields Properties='True'><FieldRef Name='LinkTitle' /><FieldRef Name='Location' /><FieldRef Name='EventDate' /><FieldRef Name='EndDate' /><FieldRef Name='fAllDayEvent'/></ViewFields>",
    		CAMLQuery: myUpcomingQuery,
    		completefunc: function(xData, Status)
    		{
    			responseUpcomingJSON = $(xData.responseXML).SPFilterNode("z:row").SPXmlToJson(
    			{
    				mapping:
    				{},
    				includeAllAttrs: true
    			});
    		}

    		/*****************************************************************/
    	});

    	return responseUpcomingJSON;
    }
	
    function truncateString(str, limit)
    {
    	if (str.length > limit)
    		return str.substring(0, limit) + "...";
    	return str;
    }

	function ResetSelection()
	{
		$("#appSelect").text()="";
		refresh();
	}
	
	
	function getUpcomingChangesQuery(currDate)
			{
				var myUpcomingQuery; 
				
			/********** Changes of selected applications **********/
					var date = currDate.toISOString().replace(/\..*/, "Z").trim();
			
					//"2014-02-28T00:00:00Z"
					myUpcomingQuery =
					"<Query>" +
						"<Where>" +
							"<Geq>" +
								"<FieldRef Name='EventDate'/>" +
								"<Value Type='DateTime' IncludeTimeValue='FALSE'>" + date + "</Value>" +
							"</Geq>" +
						"</Where>" +
						"<OrderBy>"+
							"<FieldRef Name='EventDate' Ascending='TRUE' />"+
						"</OrderBy>"+
					"<RowLimit>"+5+"</RowLimit>"+
					"</Query>";
					
				// myUpcomingQuery = "<Query>" +
						// "<FieldRef Name='EventDate'/>" +
				// "</Query>";
				
				
				return myUpcomingQuery;
		}	
	
	
	function getfilteredQuery(chgStart,chgEnd)
			{
				var myfilteredQuery; 
				// window.prompt("urlval in query = "+urlVal);
				/********** Changes of selected applications **********/
				
				myfilteredQuery =
					"<Query>" +
						"<Where><And>" +
							"<Geq>" +
								"<FieldRef Name='EventDate'/>" +
								"<Value Type='DateTime' IncludeTimeValue='FALSE'>" + chgStart + "</Value>" +
							"</Geq>" +
							"<Leq>" +
								"<FieldRef Name='EndDate'/>" +
								"<Value Type='DateTime' IncludeTimeValue='FALSE'>" + chgEnd + "</Value>" +
							"</Leq>" +
						"</And></Where>" +
						"<OrderBy>"+
						"<FieldRef Name='EventDate' Ascending='TRUE' />"+
						"</OrderBy>"+
					"</Query>";
				
				// myfilteredQuery=
				// "<Query>" +
					// "<GroupBy>" +
						// "<FieldRef Name='LinkTitle'/>" +
					// "</GroupBy>" +
				// "</Query>";
				
				
				return myfilteredQuery;
			} 