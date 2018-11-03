About
-----
Webinar plugin for Openfire is a customised version of Openfire Meetings for Webinars.

By Default, Openfire Meetings uses Jitsi Meet and Jitsi Videobridge in a N x N-1 conference mode where everyone speaks and listens to each other.
For Webinars, only the presenters and panelists are talkers while everyone else will be listeners.
On a typical server Jitsi videobridge will handle just over 1000 send-recieve HD media streams with enough CPU power to spare before the nextwork runs out of bandwidth.
That will be be just enough for a single big conference with 32  participants all talking at the same time or more realistically, 32 conferences of about 5 participants. 

That same bandwidth capacity with different a configuration for a webinar can produce a single recieve-only stream and over 1000 send-only streams for attendees.
If you add 3 more speakers, you still get a healthy 4 x 3 send-recieve for the panelists and still over 1000 streams for attendees.

This plugin does the configuration for Openfire Meetings and provides a customised Jitsi-Meet web client for the attendees. You would need to use Pade to be a presenter/speaker.