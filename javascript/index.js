var a=[],b=[],lyric_parsed=[];;
var i=0;
var audio=document.getElementById('song');
var drawing=document.getElementById('progressBar');
var context=drawing.getContext('2d');
var Lyric,h;
var k=0;var n=0;var time=0;
$lrc=$('.lrc').find('p');
function clear() {
      if(drawing.getContext){
      context.clearRect(0,0,280,2);
      $('#bar').val(0);
      }
      $('.lrc').stop(true);
      $('.lrc').css("top","0px"); 
}
function pauseOrPlay(){                                   //暂停
    if(audio.paused){
    audio.play();
    $('.lrc').animate();
     $('#start').attr('src','images/暂停.png');
     startAnim();
    return;
    }
    audio.pause();
    $('.lrc').stop();
    $('#start').attr('src','images/播放.png');
    stopAnim();  
}

function pre() {                                        //上一首
  i--;
  clear();
$('#song').attr('src',a[i].url);
$('#title').html(a[i].title);
$('#artist').html(a[i].artist);
$('#img').attr('src',a[i].picture);
  lrc_sid=b[i];getLrc();
$('#start').attr('src','images/暂停.png');
   stopAnim();
   startAnim();
   
}
function next() {                                       //下一首
  i++;
  clear();
  getsongs();
  $('#start').attr('src','images/暂停.png');
     stopAnim();
     startAnim();
  
}
function toJson(str){                                   //json数据转换
 var json = eval('(' + str + ')');
 return json;
}
function getPercentage(){                               //进度
  var percentage=(audio.currentTime/audio.duration*100);
  $('#bar').val(percentage);
  $("#bar").on('change',function(){   
    $("#bar").val(this.value);
    audio.currentTime=this.value/100*audio.duration;
    $('.lrc').stop(true);
    $('.lrc').find('p').removeClass('on');
    if(drawing.getContext){
      context.clearRect(0,0,280*percentage/100,2);
    }
});
}
  function getsongs(){                                  //get歌曲
  $.ajax({                                                                                     
          type:'post',
          url:"http://api.jirengu.com/fm/getSong.php?channel=4",
          dataTypes:'json',
          success:function(data){
                data=toJson(data);
                $('#song').attr('src',data.song[0].url);
                $('#title').html(data.song[0].title);
                $('#artist').html(data.song[0].artist);
                $('#img').attr('src',data.song[0].picture);
                a.push(data.song[0]);
                b.push(data.song[0].sid);
                lrc_sid=data.song[0].sid;
                getLrc();
                
               
          }
  });

}
function getLrc() {
  $.post('http://api.jirengu.com/fm/getLyric.php',{sid:lrc_sid})
    .done(function(lyric) {
             // sid='';
             // Lyric={};
             Lyric = parseLyric(toJson(lyric).lyric);
             $('.lrc>p').remove();      
             showLrc();         
        });
}

function parseLyric(lrc) {
  var lyrics=lrc.split('\n');
  var lrcObj={};
    for(var i=0;i<lyrics.length;i++){
        var lyric = decodeURIComponent(lyrics[i]);
        var timeReg = /\[\d*:\d*((\.|\:)\d*)*\]/g;
        var timeRegExpArr = lyric.match(timeReg);
        if(!timeRegExpArr)continue;
        var clause = lyric.replace(timeReg,'');

        for(var k = 0,h = timeRegExpArr.length;k < h;k++) {
            var t = timeRegExpArr[k];
            var min = Number(String(t.match(/\[\d*/i)).slice(1)),
                sec = Number(String(t.match(/\:\d*/i)).slice(1));
            var time = min * 60 + sec;
            lrcObj[time] = clause;
        }
    }
    return lrcObj;
}
function showLrc() {
              lyric_parsed=[];
              n=0;
              time=0;
              context.clearRect(0,0,280,2);
             for(var k in Lyric){
                  if (k>0) { 
                          var txt = Lyric[k];
                          // if(!txt)txt = "&nbsp;";
                          var p=$("<p>"+txt+"</p>");
                          $('.lrc').append(p);

                          lyric_parsed[k] = {
                          index:n++,
                          text:txt  
                          }; 
                  }
            }
}

function updateLrc() {
  var currentTime = Math.round(audio.currentTime);
  // if (lrc) {
  //   $('p').removeClass('on');
  //   $("p:contains('"+lrc+"')").addClass('on');
  // }
     if (lyric_parsed[currentTime]) { 
              k=lyric_parsed[currentTime].index;
              time=currentTime-time;
              $lrc=$('.lrc').find('p');
              $lrc.eq(k).addClass('on');
              $lrc.eq(k-1).removeClass('on');
             $('.lrc').animate({top:-25*k},time);
            } 
}
   var timeout, rotate = 0;                           //旋转
        function startAnim() {
            timeout = setInterval(function () {
                var img = document.getElementById("img");
                var rotateStyle = "rotate(" + rotate + "deg)";
                img.style.transform = rotateStyle;
                img.style["-moz-transform"] = rotateStyle;
                img.style["-webkit-transform"] = rotateStyle;
                img.style["-o-transform"] = rotateStyle;
                img.style["-ms-transform"] = rotateStyle;
                rotate += 2;
                if (rotate > 360) {
                    rotate = 0;
                }
            }, 30);
        }
        function stopAnim() {
            clearInterval(timeout);
            timeout = null;
        }
 $(document).ready(function(){
  getsongs();
  setInterval('draw()',1000);
  setInterval('updateLrc()',1000);
  startAnim(); 
});  
function draw(){                                  //canvas画进度条
  getPercentage();
    if(drawing.getContext){
      var percentage=(audio.currentTime/audio.duration*100);
      context.beginPath();
      context.lineWidth=3;
      context.moveTo(0,1);
      context.lineTo(280*percentage/100,1);
      context.strokeStyle='#f18900';
      context.stroke();
      if (percentage==100) {next();}
    }
    
}
function showLyric(){
  if ($('.box').css('display')=='none') {
    $('.box').show();
    $('.pic').hide();
  }
  else{
    $('.pic').show();
    $('.box').hide();
  }

}

  

