var camera, scene, renderer;
var geometry;
var material1 = new THREE.LineBasicMaterial( { color: 0xffffff } );
var points = [];
var diagonals = [];
var angleDeg = [];

var vec = new THREE.Vector3(); 
var pos = new THREE.Vector3(); 

init();
animate();


function init()
{
mouse = new THREE.Vector3(0, 0, 0);
renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );
document.addEventListener( 'mousedown', onDocumentMouseDown, false );
document.addEventListener('keydown', onDocumentKeyDown, false);
window.addEventListener( 'resize', onWindowResize, false );

camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 500 );
camera.position.z = 100;

scene = new THREE.Scene();
}



function onDocumentMouseDown( event ) {

    event.preventDefault();
    
    switch ( event.which ) {
        case 1: // left mouse click

        vec.set(
            ( event.clientX / window.innerWidth ) * 2 - 1,
            - ( event.clientY / window.innerHeight ) * 2 + 1,
            0.5 );
        
        vec.unproject( camera );
        
        vec.sub( camera.position ).normalize();
        
        var distance = - camera.position.z / vec.z;
        
        pos.copy( camera.position ).add( vec.multiplyScalar( distance ) );
        DrawLines(pos);

        break;

    }
  
}

function onDocumentKeyDown( event ){
    event.preventDefault();
    switch ( event.which ) {
        case 69: // if E is pressed
        if (points.length > 2)
            DrawLines(points[0]);
        break;
    }

    switch ( event.which ) {
        case 84: // if T is pressed
        points.pop();
        if (points.length > 4)
            //

            var min_index;
            var min_vertex = 9999999.99;
            var i;
            for (i = 0; i < points.length; i++){
                if (points[i].x < min_vertex){
                    min_vertex = points[i].x;
                    min_index = i;
                }
            }
            var i;
            for (i = 0; i < points.length; i++){
                if(i == min_index)
                    continue;
                if(min_vertex == points[i].x){
                    if (points[i].y < points[min_index]){
                        min_index = i;
                    }
                }
            }

            var prev_hull;
            var next_hull;
            prev_hull = (min_index-1) % points.length;
            if (prev_hull == -1)
                prev_hull = prev_hull + points.length;
            next_hull = (min_index+1) % points.length;

        
        var det;
        det = (points[min_index].x - points[prev_hull].x) * (points[next_hull].y - points[prev_hull].y) - (points[next_hull].x - points[prev_hull].x) * (points[min_index].y - points[prev_hull].y);

        points_poly = [];
        var i, prev, next, poly;
        if (det < 0){  //clockwise
            for (i = 0; i<points.length; i++){
                prev = (i-1) % (points.length);
                if (prev == -1)
                    prev = prev + points.length;
                next = (i+1) % (points.length);

                var det;
                var d1,d2,d3;
                det = (points[i].x - points[prev].x) * (points[next].y - points[prev].y) - (points[next].x - points[prev].x) * (points[i].y - points[prev].y);


                if (det < 0)
                    poly = 0; //convex
                else if(det > 0)
                    poly = 1; //concave
                else
                    poly = 2; //collinear

                points_poly.push(poly);
            }
        }

        if (det > 0){  //counterclockwise
            for (i = 0; i<points.length; i++){
                prev = (i-1) % (points.length);
                if (prev == -1)
                    prev = prev + points.length;
                next = (i+1) % (points.length);

                var det;
                det = (points[i].x - points[prev].x) * (points[next].y - points[prev].y) - (points[next].x - points[prev].x) * (points[i].y - points[prev].y);

                if (det < 0)
                    poly = 1; //concave
                else if(det > 0)
                    poly = 0; //convex
                else
                    poly = 2; //collinear
                
                points_poly.push(poly);
            }
        }


        var diagonaldict = {};
        var i;
        for(i = 0; i<points.length; i++){
            prev = (i-1) % (points.length);
            if (prev == -1)
                prev = prev + points.length;
            next = (i+1) % (points.length); 

            var diagonalarray = [];
            var j;
            for(j = 0; j<points.length; j++){
                if (j == i || j == prev || j == next)
                    continue;
                
                if (points_poly[i] == 0){
                    var diagonal = false;

                    if (det < 0)
                        diagonal = isLeft(points[i], points[j], points[next]) && !(isLeft(points[i], points[j], points[prev]));
                    if (det > 0)
                        diagonal = isLeft(points[i], points[j], points[prev]) && !(isLeft(points[i], points[j], points[next]));

                    if (diagonal)
                        diagonalarray.push(j);

                }
                else{
                    var diagonal = false;
                    if (det < 0)
                        diagonal = isLeft(points[i], points[j], points[prev]) && !(isLeft(points[i], points[j], points[next]));
                    if (det > 0)
                        diagonal = isLeft(points[i], points[j], points[next]) && !(isLeft(points[i], points[j], points[prev]));

                    if (!diagonal)
                        diagonalarray.push(j);

                }

            }
            diagonaldict[i] = diagonalarray;

        }


        console.log(diagonaldict)

        

        break;
    }
}

function isLeft(a, b, c){
    area = (b.x - a.x) * (c.y - a.y) - (c.x - a.x) * (b.y - a.y);
    console.log(area);
    if (area > 0)
        return true;
    else
        return false;
}

function DrawLines(coord){
    points.push( new THREE.Vector2( coord.x, coord.y ));

    geometry = new THREE.BufferGeometry().setFromPoints( points );

    var line = new THREE.Line( geometry, material1 );

    scene.add( line );
}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  
    renderer.setSize( window.innerWidth, window.innerHeight );
  
  }


function animate() {

    requestAnimationFrame( animate );
    renderer.render( scene, camera );

}

