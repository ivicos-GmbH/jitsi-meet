# API documentation

A minimal API documentation for Ivicos specific features.

## setBackgroundImage

### Description

The command enables to set a background for a Jitsi room.
The command can be given either a background image or a background color as input. If a background image is given, the background color will be ignored. The command ensures to broadcast the command to all the participants in a room. The synchronization is ensured via the communication of the timestamp.

### Usage

```
api.setBackgroundImage('path/to/image.png','')
api.setBackgroundImage('','red')
```

### Notification event

A notification event is sent back to each participant once the background room has been set. In order to catch this event, the following code can be used. The event contains the information regarding the background that has been set :

```
api.addListener('roomBackgroundUpdated', (e) => {
	console.log(e);
});
```

### Additional comments

A toolbar button can also be used in order to trigger the command. The corresponding ID is 'select-room-background'.

## setForegroundOverlay

### Description

The command enables to set a foreground overlay for a local participant track. The approach is to directly stick the foreground overlay on top of the usual video track. Two approaches are however possible :
1. either specifying a picture with transparency (the transparent areas will define where the participant track is maintained/visible)
2. either specifying a plain background where a shape can be carved (circle, square..)

### Usage

#### General

```
api.setForegroundOverlay(image, color, combiningMode)
```
where :
* image defines a URL for the foreground image
* color defines a color code (alternative to image)
* combiningMode is either 'fusion' (foreground added directly as a layer), 'circle' or 'square' (shapes to carve in the image)

#### Approach 1 : Transparent image as a layer

```
api.setForegroundOverlay('transparent-image.png','','fusion')
```

#### Approach 2 : Plain image to carve

```
api.setForegroundOverlay('image.png','','circle')
```

The command will create a new layer for the image and carve it with a circular shape.

### Notification event

A notification event is sent back to the local participant once the foreground overlay has been set. In order to catch this event, the following code can be used. The event contains the information regarding the foreground overlay that has been set :

```
api.addListener('foregroundOverlayUpdated', (e) => {
	console.log(e);
});
```

### Additional comments

A toolbar button can also be used in order to trigger the command. The corresponding ID is 'select-foreground-overlay'.

## getSpeakerStats (coming soon)

### Description

The command enables to get via API command the speaker statistics given back as a JSON object.
The user can either request the statistics once or at a regular interval.

### Usage

#### General

```
api.getSpeakerStats(intervalRequest) # intervalRequest being optional, in ms when given
```

#### One-time request

```
api.getSpeakerStats()
```

#### 1s-spaced requests

```
api.getSpeakerStats(1000)
```

### Notification event

A notification event is sent back to the local participant with the speaker statistics once collected. In order to catch this event, the following code can be used. The event contains the speaker stats requested by the user :

```
api.addListener('speakerStatsUpdated', (e) => {
	console.log(e);
});
```