$('.catalog_item').each(
function(i,e){
  console.log($(e).find(".tooltip_text > strong").html());
   $(e).find(".slider_item_description > span ").prepend("nb vidéo: "+$(e).find(".tooltip_text > strong").html().split(" ")[0]+"<br/>");
});

var id_episode = window.location.href.split('/')[7];
var listEpisode = {};
var infoEpisodes = {};
var listSeries = [];
var replay = true;
var canSave = {"listSeries":false,"infoEpisode":false};

chrome.storage.sync.get(null,function(result){
  if(typeof result.listSeries != "undefined"){
    listSeries = result.listSeries;
  }
  if(typeof result.infoEpisodes != "undefined"){
    for(var i=1;i<=result.infoEpisodes;i++){
      for(var o in result["infoEpisodes_"+i]){
        infoEpisodes[o]= result["infoEpisodes_"+i][o];
      }
    }
    console.log(infoEpisodes);
    loadInfoEpisode();
  }
  canSave.listSeries = true;
  canSave.infoEpisodes = true;
});

$('.episode_title').html("<a href='"+$('.icon-button').attr('href')+"' style='color:white;text-decoration:none;'>"+$('.episode_title').text()+"</a>");

$('li[class="slider_item -big"]').each(function(i,v){
    listEpisode[$(v).find('a').attr('href').split('/')[5]]=$(v).find('a').attr('href');
});
 
if(Object.keys(listEpisode).length > 0){
  var id_episodes = Object.keys(listEpisode);
  var id_nextEpisode = id_episodes[id_episodes.indexOf(id_episode)+1];
  if(id_nextEpisode){
    $('.flex-video').next().prepend('<a id="nextEpisode" href="'+listEpisode[id_nextEpisode]+'" class="button -thin -credits js-episode-open-credit" style="float:right;margin-top:10px">next episode</a>');
    console.log(listEpisode[id_nextEpisode]);
  }
}

$(function(){
  if($("section[class='episode']").length == 1){
    window.setInterval(checkVideoTime,1000);
  }
});

function checkVideoTime(){
  var currentTime = $($('.vjs-current-time-display')[0]).contents().filter(function(){return this.nodeType==Node.TEXT_NODE;}).text();
  var currentInt = parseInt(currentTime.split(":").join(""));
  var totalTime = $($('.vjs-duration-display')[0]).contents().filter(function(){return this.nodeType==Node.TEXT_NODE;}).text();
  var totalInt = parseInt(totalTime.split(":").join(""));
  var pourcent = Math.round((currentInt/totalInt)*100);
  if(currentInt > 1){
    if(replay){
      if(id_episode in infoEpisodes){
        executeScript("player2.pause();");
        if(confirm('Voulez-vous retourner à '+infoEpisodes[id_episode].time+' ('+strSeek2S(infoEpisodes[id_episode].time)+') de la vidéo ?')) {
          executeScript("player2.currentTime = "+strSeek2S(infoEpisodes[id_episode].time)+";");
          executeScript("player2.play();");
        }else {
          executeScript("player2.play();");
        }
      }
      replay = false;
    } else {
      infoEpisodes[id_episode] = {"time":currentTime,"percent":pourcent};
      if(canSave.infoEpisodes) setObject("infoEpisodes",infoEpisodes);
    }
  }
  
  if(pourcent > 80){
    if(listSeries.indexOf($('.episode_title').text()) === -1){
      listSeries.push($('.episode_title').text());
      if(canSave.listSeries) chrome.storage.sync.set({'listSeries':listSeries});
    }
    loadInfoEpisode();
  }
  
}

function loadInfoEpisode(){
  $('div[class="watched-anime"]').remove();
  $('li').find('.js-episode-open').each(function(i,v){
  	var id = $(v).attr('href').split('/')[5];
  	if(id in infoEpisodes){
  	  if(infoEpisodes[id].percent > 80){
  	    $(v).parent().find('img').after("<div class='watched-anime'>vu</div>"); 
  	  }
  	}
  });
}

function strSeek2S(string_second){
  var nbSecond = [1,60,3600];
  var nb = string_second.split(":");
  var second = 0;
  for(var i=0;i<nb.length;i++){
    second+= parseInt(nb[i])*parseInt(nbSecond[nb.length-i-1]);
  }
  return second;
}

function executeScript(e){
  var script = document.createElement('script');
  script.textContent = e;
  (document.head||document.documentElement).appendChild(script);
  script.parentNode.removeChild(script);
}

function setObject(keyName,obj){
  var limited = 200;
  var count = 0;
  var chunk = 1;
  var totalObj = {};
  totalObj[keyName+"_"+chunk]={};
  for(var o in obj){
    if(count >= limited){
      count = 0;
      chunk++;
      totalObj[keyName+"_"+chunk]={};
    }
    totalObj[keyName+"_"+chunk][o] = obj[o]; 
    count++;
  }
  totalObj[keyName]=chunk;
  chrome.storage.sync.set(totalObj);
}









