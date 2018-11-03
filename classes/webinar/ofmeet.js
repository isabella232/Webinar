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

    function urlParam(name)
    {
        var results = new RegExp('[\\?&]' + name + '=([^&#]*)').exec(window.location.href);
        if (!results) { return undefined; }
        return unescape(results[1] || undefined);
    };

    function setup()
    {
        console.log("ofmeet.js setup", APP.connection);

        if (!APP.connection)
        {
            setTimeout(function() {setup();}, 1500);
            return;
        }
        __init();

        this.connection = APP.connection.xmpp.connection;
        of.connection = connection;

        of.connection.addHandler(function(message)
        {
            //console.log("ofmeet.js incoming xmpp", message);

            $(message).find('ofmeet').each(function ()
            {
                try {

                    // these are p2p messages from users collaborating

                    if (json.event == "ofmeet.event.pdf.goto" || json.event == "ofmeet.event.pdf.ready" || json.event == "ofmeet.event.url.ready")
                    {
                        //console.log("ofmeet.js document share", json);

                        var url = json.url;

                        if (json.event == "ofmeet.event.pdf.goto" || json.event == "ofmeet.event.pdf.ready")
                        {
                            url = chrome.extension.getURL("pdf/index.html?pdf=" + json.url);
                        }

                        var ofMeetContent = document.getElementById("ofmeet-content");

                        if (!ofMeetContent)
                        {
                            OFMEET_CONFIG.documentShare = true;
                            OFMEET_CONFIG.documentUser = json.owner;
                            OFMEET_CONFIG.largeVideoContainer = document.getElementById("largeVideoContainer").innerHTML;

                            document.getElementById("largeVideoContainer").innerHTML = OFMEET_CONFIG.iframe(url);
                            ofMeetContent = document.getElementById("ofmeet-content");
                        }

                        if (json.event == "ofmeet.event.pdf.goto" || json.event == "ofmeet.event.pdf.ready")
                        {
                            // for PDF, we need echo to move page for owner
                            ofMeetContent.contentWindow.location.href = url;
                        }
                        else

                        if (!OFMEET_CONFIG.documentOwner)
                        {
                            // for URLs, ignore echo for owner
                            ofMeetContent.contentWindow.location.href = url;
                        }
                    }
                    else

                    if (json.event == "ofmeet.event.url.end")
                    {
                        if (OFMEET_CONFIG.largeVideoContainer && OFMEET_CONFIG.documentShare)
                        {
                            document.getElementById("largeVideoContainer").innerHTML = OFMEET_CONFIG.largeVideoContainer;

                            OFMEET_CONFIG.documentShare = false;
                            OFMEET_CONFIG.documentUser = null;
                            OFMEET_CONFIG.largeVideoContainer = null;

                            // above code does not work properly
                            // brute force solution is to reload
                            window.location.href = "chrome.index.html?room=" + OFMEET_CONFIG.room;
                        }
                    }
                    else

                    if (json.event == "ofmeet.event.pdf.message")
                    {
                        var ofMeetContent = document.getElementById("ofmeet-content");

                        if (ofMeetContent && (OFMEET_CONFIG.showSharedCursor || !OFMEET_CONFIG.showSharedCursor && json.from != OFMEET_CONFIG.nickName))
                        {
                            //console.log("ofmeet.event.pdf.message", json);
                            ofMeetContent.contentWindow.handlePdfShare(json.msg, json.from);
                        }
                    }
                    else

                    if (json.event == "ofmeet.event.url.message")
                    {
                        var ofMeetContent = document.getElementById("ofmeet-content");

                        if (ofMeetContent)
                        {
                            //console.log("ofmeet.event.url.message", json);
                            ofMeetContent.contentWindow.postMessage({ action: 'ofmeet.action.url.share', json: json}, '*');
                        }
                    }


                } catch (e) {}
            });

            return true;

        }, "jabber:x:ofmeet", 'message');

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
            checkIfDocOwnerGone(id);
        });

        APP.conference.addConferenceListener(JitsiMeetJS.events.conference.USER_JOINED, function(id)
        {
            console.log("ofmeet.js user joined", id);
            refreshShare(id);
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
            APP.UI.toggleFilmstrip();
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

    function getUniqueID()
    {
            return Math.random().toString(36).substr(2, 9);
    }

    function refreshShare(id)
    {
        if (OFMEET_CONFIG.documentShare && OFMEET_CONFIG.documentOwner && id.indexOf(OFMEET_CONFIG.username + "-") == -1)
        {
            var data = {event: "ofmeet.event.url.ready"};

            if (OFMEET_CONFIG.bgWin.pade.activeUrl.indexOf(".pdf") > -1)
            {
                data.event = "ofmeet.event.pdf.ready";
            }

            data.from = OFMEET_CONFIG.nickName;
            data.username = OFMEET_CONFIG.username;
            data.url = OFMEET_CONFIG.currentUrl;
            data.owner = data.username;

            console.log("ofmeet.js refreshShare", id, data);

            setTimeout(function()
            {
                APP.conference._room.sendOfMeet(JSON.stringify(data));

            }, 3000);
        }
    }

    function checkIfDocOwnerGone(id)
    {
        if (OFMEET_CONFIG.documentUser && id.indexOf(OFMEET_CONFIG.documentUser + "-") > -1)
        {
            // owner gone, end
            APP.conference._room.sendOfMeet('{"event": "ofmeet.event.url.end"}');
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


// external called from Jitsi-Meet

function ofmeetEtherpadClicked()
{
    console.log("ofmeet.etherpadClicked", OFMEET_CONFIG.bgWin.pade.activeUrl);

    if (OFMEET_CONFIG.bgWin.pade.activeUrl)
    {
        if (OFMEET_CONFIG.documentShare)
        {
            if (OFMEET_CONFIG.documentOwner)
            {
                OFMEET_CONFIG.documentShare = false;
                OFMEET_CONFIG.documentOwner = false;
                OFMEET_CONFIG.documentUser = null;
                OFMEET_CONFIG.largeVideoContainer = null;

                document.getElementById("largeVideoContainer").innerHTML = OFMEET_CONFIG.largeVideoContainer;

                // above code does not work properly
                // brute force solution is to reload

                APP.conference._room.sendOfMeet('{"event": "ofmeet.event.url.end"}');
                window.location.reload();
            }
        }
        else {
            OFMEET_CONFIG.documentShare = true;
            OFMEET_CONFIG.documentOwner = true;

            OFMEET_CONFIG.largeVideoContainer = document.getElementById("largeVideoContainer").innerHTML;

            var url = OFMEET_CONFIG.bgWin.pade.activeUrl;

            if (OFMEET_CONFIG.bgWin.pade.activeUrl.indexOf(".pdf") > -1)
            {
                url = chrome.extension.getURL("pdf/index.html?pdf=" + OFMEET_CONFIG.bgWin.pade.activeUrl);
            }

            document.getElementById("largeVideoContainer").innerHTML = OFMEET_CONFIG.iframe(url);
        }
    }
}
