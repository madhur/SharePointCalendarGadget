// Enable support of cross domain origin request

jQuery.support.cors = true;

// Disable caching of AJAX responses - Stop IE reusing cache data for the same requests
$.ajaxSetup(
{
	cache: false
});
var changeCalendarList = "Calendar"

// "https://teams.aexp.com/sites/teamsitewendy/";
//$().SPServices.defaults.webURL = "https://teams.aexp.com/sites/teamsitewendy/";
$().SPServices.defaults.listName = changeCalendarList;
var responseJSON, responsefilteredJSON, date1, date2, title, onDateClickText, date1parse, date2parse, appName;
var selectedValues1 = new Array();
var selectedValues2 = new Array();
var selectedValues = new Array();
var list="";
var allValues = new Array();
var selectedVal="";
var appSelectOptions = "";
var i, j;
var appNamesDistinct = new Array();
var filteredAppNames = new Array();
var flag=0;

$("#appSelect").css("overflow", "auto");

function initLoad()
{
	if (IsGadget())
	{
		// window.prompt("In Init");
		System.Gadget.onSettingsClosing = SettingsClosing;
	} 
	$().SPServices.defaults.webURL = getSelectedValues();
	$().SPServices.defaults.listName = getlistName();
	// window.prompt("$().SPServices.defaults.webURL = "+$().SPServices.defaults.webURL);
}

function SettingsClosing(event)
{
	if (IsGadget())
	{		
		// window.prompt("In Settings Closing");
		// Save the settings if the user clicked OK.
		if (event.closeAction == event.Action.commit)
		{	
			setSelectedValues();
			setlistName();
			System.Gadget.document.parentWindow.settingsHaveChanged();
		}
		// Allow the Settings dialog to close.

		event.cancel = false;
	}
}


function onlyUnique(value, index, self)
{
	return self.indexOf(value) === index;
}

function IsGadget()
{
	var IsGadgetrun = (window.System != undefined);
	return IsGadgetrun;
}

function getSelectedValues()
{
	if (IsGadget())
	{
		selectedVal = System.Gadget.Settings.readString("app");
	}
	// window.prompt("Read selectedVal " +selectedVal);
	$("#appSelect").val(selectedVal);
	return selectedVal;	
}

function setSelectedValues()
{
	selectedVal=$("#appSelect").val();
	// window.prompt("SelVal = "+selectedVal);
	if(selectedVal.length==0)
		onReset();
		
	if (IsGadget())
		{
			System.Gadget.Settings.writeString("app", selectedVal);
		}
}

function getlistName()
{
	if (IsGadget())
	{
		list = System.Gadget.Settings.readString("listname");
	}
	// window.prompt("Read selectedVal " +selectedVal);
	$("#listSelect").val(list);
	return list;	
}

function setlistName()
{
	list=$("#listSelect").val();
	// window.prompt("SelVal = "+selectedVal);
	if(list.length==0)
		onReset();
		
	if (IsGadget())
		{
			System.Gadget.Settings.writeString("listname", list);
		}
}

function ResetSelection()
	{
		$("#appSelect").text()="";
		$("#listSelect").text()="";
	}

function onReset()
{
		if (IsGadget())
		{
			System.Gadget.Settings.writeString("app","");
			System.Gadget.Settings.writeString("listname","");
		}
}

/*******  	CAML QUERY		******/
function getQuery()
{
	var myQuery =
		"<Query>" +
		"<GroupBy>" +
		"<FieldRef Name='LinkTitle'/>" +
		"</GroupBy>" +
		"</Query>";
	return myQuery;
}


function OnDivScroll()
{
    var listappSelect = document.getElementById("appSelect");

    if (listappSelect.options.length > 8)
    {
        listappSelect.size=listappSelect.options.length;
    }
    else
    {
        listappSelect.size=8;
    }
}

function OnSelectFocus()
{
    // if (document.getElementById("appSelectDiv").scrollLeft != 0)
    // {
        // document.getElementById("appSelectDiv").scrollLeft = 0;
    // }

    var listappSelect = document.getElementById("appSelect");
    if( listappSelect.options.length > 8)
    {
        listappSelect.focus();
        listappSelect.size=8;
    }
}

function formatOWSItem(item, idx)
{
	var tmpStr = "";
	if (item === null || item === undefined)
	{
		// return empty string for null items
		return "";
	}
	else
	{

		tmpStr = item.split(';#');
		return tmpStr[idx];
	}
}