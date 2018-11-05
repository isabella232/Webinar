/**
 * ofmeet.js
 */

var ofmeet = (function(of)
{
    var firstTime = true;
    var firstTrack = true;
    var participants = {}
    var largeVideo = null;
    var remoteController = null;
    var remoteControlPort = null;

    var nickColors = {}

    var getRandomColor = function getRandomColor(nickname)
    {
        if (nickColors[nickname])
        {
            return nickColors[nickname];
        }
        else {
            var letters = '0123456789ABCDEF';
            var color = '#';

            for (var i = 0; i < 6; i++) {
                color += letters[Math.floor(Math.random() * 16)];
            }
            nickColors[nickname] = color;
            return color;
        }
    }


    of.createAvatar = function(nickname, width, height, font)
    {
        if (!width) width = 32;
        if (!height) height = 32;
        if (!font) font = "16px Arial";

        var canvas = document.createElement('canvas');
        canvas.style.display = 'none';
        canvas.width = width;
        canvas.height = height;
        document.body.appendChild(canvas);
        var context = canvas.getContext('2d');
        context.fillStyle = getRandomColor(nickname);
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.font = font;
        context.fillStyle = "#fff";

        var first, last;
        var name = nickname.split(" ");
        var l = name.length - 1;

        if (name && name[0] && name.first != '')
        {
            first = name[0][0];
            last = name[l] && name[l] != '' && l > 0 ? name[l][0] : null;

            if (last) {
                var initials = first + last;
                context.fillText(initials.toUpperCase(), 3, 23);
            } else {
                var initials = first;
                context.fillText(initials.toUpperCase(), 10, 23);
            }
            var data = canvas.toDataURL();
            document.body.removeChild(canvas);
        }

        return canvas.toDataURL();
    }

    function setup()
    {
        console.log("ofmeet.js setup", APP.connection);

        if (!APP.connection)
        {
            setTimeout(function() {setup();}, 1500);
            return;
        }
        __init();

        APP.connection.addEventListener(JitsiMeetJS.events.connection.CONNECTION_DISCONNECTED, function()
        {
            console.error("Connection Failed!", name)
        });

        APP.connection.addEventListener(JitsiMeetJS.events.connection.CONNECTION_DISCONNECTED, function()
        {
            console.log("Connection Disconnected!")
        });
    }

    function __init()
    {
        console.log("ofmeet.js __init");

        of.subtitles = document.getElementById("subtitles");

        APP.conference.addConferenceListener(JitsiMeetJS.events.conference.CONFERENCE_JOINED, function()
        {
            console.log("ofmeet.js me joined");
        });

        APP.conference.addConferenceListener(JitsiMeetJS.events.conference.CONFERENCE_LEFT, function()
        {
            console.log("ofmeet.js me left");
        });

        APP.conference.addConferenceListener(JitsiMeetJS.events.conference.MESSAGE_RECEIVED , function(id, text, ts)
        {
            var participant = APP.conference.getParticipantById(id);
            var displayName = participant ? participant._displayName || id.split("-")[0] : "Me";

            console.log("ofmeet.js message", id, text, ts, displayName);

            if (OFMEET_CONFIG.enableCaptions && text.indexOf("https://") == -1)
            {
                of.subtitles.innerHTML = displayName + " : " + text;
            }
        });

        APP.conference.addConferenceListener(JitsiMeetJS.events.conference.USER_LEFT, function(id)
        {
            console.log("ofmeet.js user left", id);
        });

        APP.conference.addConferenceListener(JitsiMeetJS.events.conference.USER_JOINED, function(id)
        {
            console.log("ofmeet.js user joined", id);
        });

        APP.conference.addConferenceListener(JitsiMeetJS.events.conference.DOMINANT_SPEAKER_CHANGED, function(id)
        {
            //console.log("ofmeet.js dominant speaker changed", id);
        });

        APP.conference.addConferenceListener(JitsiMeetJS.events.conference.TRACK_REMOVED, function(track)
        {
            //console.log("ofmeet.js track removed", APP.conference.getMyUserId(), track.getParticipantId(), track.getType());
        });

        APP.conference.addConferenceListener(JitsiMeetJS.events.conference.TRACK_ADDED, function(track)
        {
            if (APP.conference.getMyUserId() == track.getParticipantId())
            {
                console.log("ofmeet.js track added", track.getParticipantId(), track.getType());
            }
        });

        APP.conference.addConferenceListener(JitsiMeetJS.events.conference.TRACK_MUTE_CHANGED, function(track)
        {
            console.log("ofmeet.js track muted", track.getParticipantId(), track.getType(), track.isMuted());
        });

        if (APP.conference.roomName)
        {
            if (OFMEET_CONFIG.mode == "presenter" || OFMEET_CONFIG.mode == "attendee")
            {
                APP.UI.toggleFilmstrip();
                if (OFMEET_CONFIG.mode == "presenter") APP.UI.clickOnVideo(0)
            }

            document.title = interfaceConfig.APP_NAME + " - " + APP.conference.roomName;

            OFMEET_CONFIG.nickName = APP.conference.getMyUserId().split("-")[0];
            OFMEET_CONFIG.room = APP.conference.roomName;

            if (OFMEET_CONFIG.nickName)
            {
                OFMEET_CONFIG.username = OFMEET_CONFIG.nickName;

                OFMEET_CONFIG.userAvatar = of.createAvatar(OFMEET_CONFIG.nickName);
                APP.conference.changeLocalAvatarUrl(OFMEET_CONFIG.userAvatar);
            }

            /*
            $("#remoteVideos .videocontainer:not(#mixedstream)").each(function()
            {
                var remoteUser = $(this).attr('id');

                if (remoteUser.indexOf("_" + OFMEET_CONFIG.presenter + "-") > -1)
                {
                    $(this).click();
                }
            })
            */
        }
    }

    window.addEventListener("beforeunload", function(e)
    {
        console.log("ofmeet.js beforeunload");

        //e.returnValue = 'Ok';

        APP.conference._room.leave();

        if (of.connection)
        {
            of.connection.disconnect();
        }
    });

    window.addEventListener("unload", function (e)
    {
        console.log("ofmeet.js unload");
    });

    window.addEventListener("DOMContentLoaded", function()
    {
        console.log("ofmeet.js load");
        setTimeout(function() {setup();}, 1000);
    });

    if (OFMEET_CONFIG)
    {

    }

    return of;

}(ofmeet || {}));
