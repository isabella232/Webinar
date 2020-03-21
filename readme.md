# About
Webinar plugin for Openfire is a customised version of Jitsi-Meet in Openfire Meetings for Webinars.

By Default, Openfire Meetings uses Jitsi Meet and Jitsi Videobridge in a N x N-1 conference mode where everyone speaks and listens to each other.
For Webinars, only the presenters and panelists are talkers while everyone else will be listeners.
On a typical server Jitsi videobridge will handle just over 1000 send-recieve HD media streams with enough CPU power to spare before the nextwork runs out of bandwidth.
That will be be just enough for a single big conference with 32  participants all talking at the same time or more realistically, 32 conferences of about 5 participants. 

That same bandwidth capacity with different a configuration for a webinar can produce a single recieve-only stream and over 1000 send-only streams for attendees.
If you add 3 more speakers, you still get a healthy 4 x 3 send-recieve for the panelists and still over 1000 streams for attendees.

This plugin requires Openfire Meetings and re-uses the configuration for Openfire Meetings to provide a customised Jitsi-Meet web client for the presenter and attendees. 
You can also use Jitsi Meet in Openfire Meetings as a presenter/speaker.

# How to use
- Presenter should use URL https://your_openfire_meetings_server:7443/webinar/your_room?mode=presenter
- Attendee should use URL https://your_openfire_meetings_server:7443/webinar/your_room?mode=attendee