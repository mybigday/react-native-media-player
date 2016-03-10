const RenderStatusList = [
	"Idle",
	"Rending",
	"RendOut"
];

const MusicStatusList = [
	"Playing",
	"End"
];

const PushWayList = [
	"AtLast",
	"AfterNow",
	"Interrupt",
	"ClearOther"
];

const GroupStatusList = [
	"Start",
	"Stop",
	"RendStart",
	"RendStop",
	"RendFinished",
	"ReRend",
	"PushRend",
	"MusicStart",
	"MusicStop",
	"MusicFinished",
	"PushMusic"
];

const EventChannelList = [
	"RENDER_STATUS",
	"MUSIC_STATUS",
	"GROUP_STATUS"
];

let RENDER_STATUS = {};
RenderStatusList.forEach((renderStatus) => {
	RENDER_STATUS[renderStatus] = renderStatus;
});
let MUSIC_STATUS = {};
MusicStatusList.forEach((musicStatus) => {
	MUSIC_STATUS[musicStatus] = musicStatus;
});
let PUSH_WAY = {};
PushWayList.forEach((pushWay) => {
	PUSH_WAY[pushWay] = pushWay;
});
let GROUP_STATUS = {};
GroupStatusList.forEach((groupStatus) => {
	GROUP_STATUS[groupStatus] = groupStatus;
});
let EVENT_CHANNEL = {};
EventChannelList.forEach((eventChannel) => {
	EVENT_CHANNEL[eventChannel] = eventChannel;
});

module.exports = {
	RENDER_STATUS: RENDER_STATUS,
	MUSIC_STATUS: MUSIC_STATUS,
	PUSH_WAY: PUSH_WAY,
	GROUP_STATUS: GROUP_STATUS,
	EVENT_CHANNEL: EVENT_CHANNEL
};