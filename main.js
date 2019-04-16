mapboxgl.accessToken = 'pk.eyJ1IjoienN0YXRtYW53ZWlsIiwiYSI6ImNqbWY3b3V2cjAyMWUzcXBmNXRzdHNnOWEifQ.E-JUGH3ab30ya_NXealg_A';

// Set bounds
var bounds = [
    [-167.695312, 17.644022], // Southwest coordinates
    [-41.132815, 74.683250]  // Northeast coordinates
];

// Initialize map
var map = new mapboxgl.Map({
    attributionControl: false,
    container: 'map',
    style: 'mapbox://styles/mapbox/light-v10', // replace this with your style URL
    center: [ -122.368135, 37.864116 ],
    zoom: 9,
    maxBounds: bounds // Sets bounds as max
});

map.addControl(new mapboxgl.AttributionControl({
    compact: true
}));

// Add zoom and rotation controls to the map.
map.addControl(new mapboxgl.NavigationControl());

function mapReset() {}

map.loadImage('img/face.png', function(error, image) {
    if (error) throw error;
    map.addImage('aaron', image);
});

map.loadImage('img/lucy.png', function(error, image) {
    if (error) throw error;
    map.addImage('lucy', image);
});

map.on('load', function() {
    mapReset();
    map.addSource("houses", {
        type: 'geojson',
        data: './data/housing.geojson',
    });
    map.addLayer({
        id: "points",
        type: "symbol",
        source: "houses",
        layout: {
            "icon-image": ["case",
                           ["==",
                            ["get", "Roommates"],
                            "Lucy Rose Taylor"
                           ],
                           "lucy",
                           "aaron"
                          ],
            "icon-size": ["case",
                          ["==",
                           ["get", "Roommates"],
                           "Lucy Rose Taylor"
                          ],
                          .25,
                          .25
                         ]
        }
    });
});

var popup;

// Change the cursor to a pointer when the mouse is over the points layer.
map.on('mouseenter', 'points', function () {
    map.getCanvas().style.cursor = 'pointer';
});

// Change it back to a pointer when it leaves.
map.on('mouseleave', 'points', function () {
    map.getCanvas().style.cursor = '';

    if (popup !== undefined) {
        popup.remove();
    }
});

function splitRoommates(roommmates) {
    return roommmates.split('/').map(function(name){
        return name.trim();
    });
}

function makeLi(roommate) {
    return '<li>' + roommate + '</li>';
}

function makeRoommateUl(roommateList) {
    var ul = "<ul>";
    roommateList.forEach(function(roommate) {
        ul += makeLi(roommate);
    });

    return ul;
}

function generateHtml(start, address, roommates) {
    var html = '';
    html += '<h3>Aaron\'s Crib:</h3>';
    html += '<div>';
    html += '  <h4>Move-in date:</h4>';
    html += '  <p>';
    html +=      start;
    html += '  </p>';
    html += '  <h4>Address:</h4>';
    html += '  <p>';
    html +=      address;
    html += '  </p>';
    html += '  <h4>Roomies:</h4>';
    html +=    makeRoommateUl( splitRoommates(roommates) );
    html += '</div>';

    return html;
}

// Add popups
map.on('mouseenter', 'points', function (e) {
    var coordinates = e.features[0].geometry.coordinates.slice();
    var address = e.features[0].properties.Address;
    var roommates = e.features[0].properties.Roommates;
    var start = e.features[0].properties.Start;

    // Ensure that if the map is zoomed out such that multiple
    // copies of the feature are visible, the popup appears
    // over the copy being pointed to.
    while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
        coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
    }
    //var features = feature[0];
    var markerHeight = 20, markerRadius = 10, linearOffset = 25;
    var popupOffsets = {
        'top': [0, 0],
        'top-left': [0,0],
        'top-right': [0,0],
        'bottom': [0, -markerHeight],
        'bottom-left': [linearOffset, (markerHeight - markerRadius + linearOffset) * -1],
        'bottom-right': [-linearOffset, (markerHeight - markerRadius + linearOffset) * -1],
        'left': [markerRadius, (markerHeight - markerRadius) * -1],
        'right': [-markerRadius, (markerHeight - markerRadius) * -1]
    };

    popup = new mapboxgl.Popup({offsets: popupOffsets});
    popup.setLngLat(coordinates);

    var html = generateHtml(start, address, roommates);
    popup.setHTML(html);
    popup.addTo(map);
});
