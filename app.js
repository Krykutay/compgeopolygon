var camera, scene, renderer;
var geometry;
var material1 = new THREE.LineBasicMaterial( { color: 0xffffff } );
var material2 = new THREE.LineBasicMaterial( { color: 0x0000ff } );
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

                var det1;
                det1 = (points[i].x - points[prev].x) * (points[next].y - points[prev].y) - (points[next].x - points[prev].x) * (points[i].y - points[prev].y);


                if (det1 < 0)
                    poly = 0; //convex
                else if(det1 > 0)
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

                var det2;
                det2 = (points[i].x - points[prev].x) * (points[next].y - points[prev].y) - (points[next].x - points[prev].x) * (points[i].y - points[prev].y);

                if (det2 < 0)
                    poly = 1; //concave
                else if(det2 > 0)
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
            if (i == 7){
                //
            }
                
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
                else if (points_poly[i] == 1){
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



        
        // Check if diagonals hit an edge
        var badDiagonals = {}; // diagonals that cut an edge

        for (i = 0; i < points.length; i++){
            var j;
            var temparray = [];
            for (j = 0; j < diagonaldict[i].length; j++){
                var p1, p2, q1, q2;
                p1 = points[i];
                q1 = points[diagonaldict[i][j]];
                var k;
                for (k = 0; k < points.length; k++){
                    if (i == 1 && j == 6 && k == 1){
                        j = 6;
                    }
                    if(k == i || (k+1) % points.length == i || k % points.length == diagonaldict[i][j] || (k+1) % points.length == diagonaldict[i][j])
                        continue;

                    p2 = points[k % points.length];
                    q2 = points[(k+1) % points.length];

                    if (doIntersect(p1, q1, p2, q2)){
                        temparray.push(diagonaldict[i][j]);
                        break;
                    }
                }
                
            }
            badDiagonals[i] = temparray;
            
        }


        for (i = 0; i<points.length; i++){
            var j;
            for (j = 0; j < badDiagonals[i].length; j++){
                var index = diagonaldict[i].indexOf(badDiagonals[i][j]);
                diagonaldict[i].splice(index, 1);
            }
        }

        

        
        
        // Graph coloring
        
        

        for (i = 0; i<points.length-1; i++){
            var j;
            for (j = 0; j < diagonaldict[i].length; j++){
                if (diagonaldict[i][j] == -1)
                    continue;
                var baddiagonalgrapgh = {};
                var x;
                for (x = 0; x < points.length; x++){
                    baddiagonalgrapgh[x] = [];
                }
                var p1;
                var q1;
                p1 = points[i];
                q1 = points[diagonaldict[i][j]];
                var k;
                for (k = i+1; k<points.length;k++){
                    var tempbads = [];
                    var l;
                    for(l = 0; l < diagonaldict[k].length; l++){
                        if (diagonaldict[k][l] == -1)
                            continue;
                        if(i == k || i == diagonaldict[k][l] || diagonaldict[i][j] == k || diagonaldict[i][j] == diagonaldict[k][l]){
                            continue;
                        }
                        var p2, q2; 
                        p2 = points[k];
                        q2 = points[diagonaldict[k][l]];

                        if (doIntersect(p1, q1, p2, q2)){
                            diagonaldict[k][l] = -1;
                        }
                    }
        
                }

            }    
        }  
        
        
        
        
        var pointsD = [];

        for(i = 0; i<points.length; i++){
            pointsD.push(points[i]);
            var j;
            for(j = 0; j < diagonaldict[i].length; j++){
                if (diagonaldict[i][j] == -1)
                    continue;
                pointsD.push(points[diagonaldict[i][j]]);
                geometry = new THREE.BufferGeometry().setFromPoints( pointsD );
    
                var line = new THREE.Line( geometry, material2 );
            
                scene.add( line );
                var pointsD = [];
                pointsD.push(points[i]);
            }
            var pointsD = [];

        }
        

        
        console.log(diagonaldict);

        break;
    }
}

function isLeft(a, b, c){
    var area = (b.x - a.x) * (c.y - a.y) - (c.x - a.x) * (b.y - a.y);
    if (area > 0)
        return true;
    else
        return false;
}

function onSegment(p, q, r){
    if ((q.x <= Math.max(p.x, r.x)) && (q.x >= Math.min(p.x, r.x)) && (q.y <= Math.max(p.y, r.y)) && (q.y >= Math.min(p.y, r.y)))
        return true;

    return false;
}

function orientationOfLines(p, q, r){

    var val = ((q.y - p.y) * (r.x - q.x)) - ((q.x - p.x) * (r.y - q.y));
    if (val > 0)
        return 1  //clockwise
    else if (val < 0)
        return 2  //counterclockwise
    else
        return 0  //colinear
}

function doIntersect(p1,q1,p2,q2){
      
    var o1 = orientationOfLines(p1, q1, p2) 
    var o2 = orientationOfLines(p1, q1, q2) 
    var o3 = orientationOfLines(p2, q2, p1) 
    var o4 = orientationOfLines(p2, q2, q1) 
  
    if ((o1 != o2) && (o3 != o4))
        return true
  
    // Special Cases 
  
    // p1 , q1 and p2 are colinear and p2 lies on segment p1q1 
    if ((o1 == 0) && onSegment(p1, p2, q1))
        return true
  
    // p1 , q1 and q2 are colinear and q2 lies on segment p1q1 
    if ((o2 == 0) && onSegment(p1, q2, q1))
        return true
  
    // p2 , q2 and p1 are colinear and p1 lies on segment p2q2 
    if ((o3 == 0) && onSegment(p2, p1, q2))
        return true
  
    // p2 , q2 and q1 are colinear and q1 lies on segment p2q2 
    if ((o4 == 0) && onSegment(p2, q1, q2))
        return true
  
    // If none of the cases 
    return false

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

