<%@ page import="org.jivesoftware.util.*, org.jivesoftware.openfire.*, java.util.*" %>
<%
    String hostname = request.getServerName();           
    String port = JiveGlobals.getProperty("httpbind.port.secure", "7443");    
    String domain = XMPPServer.getInstance().getServerInfo().getXMPPDomain();    

    String wssUrl = "wss://" + hostname + ":" + port + "/ws/";

%>
<html itemscope itemtype="http://schema.org/Product" prefix="og: http://ogp.me/ns#" xmlns="http://www.w3.org/1999/html">
  <head>
    <meta charset="utf-8">
    <meta http-equiv="content-type" content="text/html;charset=utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <link rel="stylesheet" href="css/all.css?v=3084">

    <script>
        function urlParam(name)
        {
            var results = new RegExp('[\\?&]' + name + '=([^&#]*)').exec(window.location.href);
            if (!results) { return undefined; }
            return unescape(results[1] || undefined);
        };   
        
        var confMode = urlParam("mode");
        if (!confMode) confMode = "attendee";
        
        var webinarPresenter = confMode != "attendee"     

        var config = {
            hosts: {
                domain: '<%= domain%>',
                muc: 'conference.<%= domain%>'
            },
            disableSimulcast: <%= !"true".equals(JiveGlobals.getProperty("org.jitsi.videobridge.ofmeet.simulcast", "true")) %>,
            enableRemb: false, 
            enableTcc: true, 
            resolution: <%= JiveGlobals.getProperty("org.jitsi.videobridge.ofmeet.resolution", "720") %>,
            constraints: {
                video: {
                    aspectRatio: <%= JiveGlobals.getProperty("org.jitsi.videobridge.ofmeet.constraints.video.aspectratio.ideal", "16 / 9") %>,
                    height: {
                        ideal: <%= JiveGlobals.getProperty("org.jitsi.videobridge.ofmeet.constraints.video.height.ideal", "720") %>,
                        max: <%= JiveGlobals.getProperty("org.jitsi.videobridge.ofmeet.constraints.video.height.max", "720") %>,
                        min: <%= JiveGlobals.getProperty("org.jitsi.videobridge.ofmeet.constraints.video.height.min", "240") %>,  
                    }
                }   
            },            
            openBridgeChannel: false,
            bosh: '<%= wssUrl %>',
            clientNode: 'http://igniterealtime.org/webinar/attendee',
            disableSuspendVideo: true,
            desktopSharingChromeExtId: null,
            desktopSharingChromeDisabled: true,
            desktopSharingChromeSources: [],
            desktopSharingChromeMinExtVersion: '0.1',
            desktopSharingFirefoxDisabled: true,
            channelLastN: -1,
            enableWelcomePage: false,
            enableUserRolesBasedOnToken: false,
            p2p: {
                enabled: false,
                stunServers: [
                    { urls: 'stun:stun.l.google.com:19302' },
                    { urls: 'stun:stun1.l.google.com:19302' },
                    { urls: 'stun:stun2.l.google.com:19302' }
                ],
                preferH264: true
            },
            deploymentInfo: {
            }
        }
        var interfaceConfig = {
            DEFAULT_BACKGROUND: '#474747',
            DESKTOP_SHARING_BUTTON_DISABLED_TOOLTIP: null,
            INITIAL_TOOLBAR_TIMEOUT: 20000,
            TOOLBAR_TIMEOUT: 4000,
            DEFAULT_REMOTE_DISPLAY_NAME: 'Participant',
            DEFAULT_LOCAL_DISPLAY_NAME: 'me',
            SHOW_JITSI_WATERMARK: false,
            JITSI_WATERMARK_LINK: 'http://igniterealtime.org',

            SHOW_WATERMARK_FOR_GUESTS: false,
            SHOW_BRAND_WATERMARK: false,
            BRAND_WATERMARK_LINK: '',
            SHOW_POWERED_BY: false,
            SHOW_DEEP_LINKING_IMAGE: false,
            GENERATE_ROOMNAMES_ON_WELCOME_PAGE: true,
            DISPLAY_WELCOME_PAGE_CONTENT: true,
            APP_NAME: 'Openfire Meetings',
            NATIVE_APP_NAME: 'Openfire Meetings',
            LANG_DETECTION: false, // Allow i18n to detect the system language
            INVITATION_POWERED_BY: true,

            AUTHENTICATION_ENABLE: true,

            TOOLBAR_BUTTONS: [
                'fullscreen', 'fodeviceselection', 'hangup', 'profile', 'info', 'chat',
                'settings', 'videoquality', 'feedback', 'stats', 'shortcuts', 'raisehand'                          
            ],

            SETTINGS_SECTIONS: [ 'language', 'moderator', 'profile', 'calendar' ],

            VIDEO_LAYOUT_FIT: 'both',
            filmStripOnly: false,
            VERTICAL_FILMSTRIP: true,

            CLOSE_PAGE_GUEST_HINT: false,
            RANDOM_AVATAR_URL_PREFIX: false,
            RANDOM_AVATAR_URL_SUFFIX: false,
            FILM_STRIP_MAX_HEIGHT: confMode == "attendee" ? 0 : 100,

            ENABLE_FEEDBACK_ANIMATION: false,
            DISABLE_FOCUS_INDICATOR: false,
            DISABLE_DOMINANT_SPEAKER_INDICATOR: false,

            DISABLE_RINGING: false,
            AUDIO_LEVEL_PRIMARY_COLOR: 'rgba(255,255,255,0.4)',
            AUDIO_LEVEL_SECONDARY_COLOR: 'rgba(255,255,255,0.2)',
            POLICY_LOGO: null,
            LOCAL_THUMBNAIL_RATIO: 16 / 9, // 16:9
            REMOTE_THUMBNAIL_RATIO: 1, // 1:1

            LIVE_STREAMING_HELP_LINK: 'https://jitsi.org/live',
            MOBILE_APP_PROMO: false,
            MAXIMUM_ZOOMING_COEFFICIENT: 1.3,
            SUPPORT_URL: 'https://github.com/jitsi/jitsi-meet/issues/new',
            CONNECTION_INDICATOR_AUTO_HIDE_ENABLED: true,
            CONNECTION_INDICATOR_AUTO_HIDE_TIMEOUT: 5000,
            VIDEO_QUALITY_LABEL_DISABLED: false,

            _BACKGROUND_BLUR: 'off'
        };

        var OFMEET_CONFIG = {
            mode: confMode,
            showSharedCursor: true,
            hostname: "<%= hostname %>",
            domain: "<%= domain%>",
            enableCaptions: true,
            iframe: function(url) {
                return '<iframe src=' + url + ' id="ofmeet-content" style="width: 100%; height: 100%; border: 0;padding-left: 0px; padding-top: 0px;">';
            },
        };
        
        if (confMode != "attendee")
        {
            interfaceConfig.TOOLBAR_BUTTONS.push('camera');
            interfaceConfig.TOOLBAR_BUTTONS.push('microphone');
            interfaceConfig.TOOLBAR_BUTTONS.push('desktop');    
            interfaceConfig.TOOLBAR_BUTTONS.push('livestreaming');     
            interfaceConfig.TOOLBAR_BUTTONS.push('sharedvideo');    
            interfaceConfig.TOOLBAR_BUTTONS.push('filmstrip');    
            interfaceConfig.TOOLBAR_BUTTONS.push('raisehand');  
            interfaceConfig.TOOLBAR_BUTTONS.push('invite');    
            interfaceConfig.TOOLBAR_BUTTONS.push('tileview');    
        }
    </script>

    <script src="libs/do_external_connect.min.js"></script>
    <script src="logging_config.js"></script>
    <script src="libs/lib-jitsi-meet.min.js?v=3084"></script>
    <script src="libs/app.bundle.min.js?v=3084"></script>
    <script src="ofmeet.js"></script>
  </head>
  <body>
    <div id="react"></div>
    <div id="subtitles" style="position: absolute; bottom: 10%; left: 10%; z-index: 2; font-weight: 600; font-size: 24px; text-align: left; color: #FFF;   opacity: .80; text-shadow: 0px 0px 1px rgba(0,0,0,0.3),0px 1px 1px rgba(0,0,0,0.3),1px 0px 1px rgba(0,0,0,0.3),0px 0px 1px rgba(0,0,0,0.3)"></div>    
  </body>
</html>
