<?php
header('Content-Type: application/json');
error_reporting(E_ALL);
/*
*   	Busqueda de feature/s mas cercana al punto recibido dentro de los servicios de IDERA.
*	Args: Coordenada x,y en EPSG:4326 y tipo de objeto a buscar segun catalogo de IDERA.
*		x,y,tipo
*	Return: geojson with results
*/

function array_sort($array, $on, $order=SORT_ASC)
{
    $new_array = array();
    $sortable_array = array();

    if (count($array) > 0) {
        foreach ($array as $k => $v) {
            if (is_array($v)) {
                foreach ($v as $k2 => $v2) {
                    if ($k2 == $on) {
                        $sortable_array[$k] = $v2;
                    }
                }
            } else {
                $sortable_array[$k] = $v;
            }
        }

        switch ($order) {
            case SORT_ASC:
                asort($sortable_array);
            break;
            case SORT_DESC:
                arsort($sortable_array);
            break;
        }

        foreach ($sortable_array as $k => $v) {
            $new_array[] = $array[$k];
        }
    }

    return $new_array;
}

if (isset($_REQUEST['x']) and isset($_REQUEST['y']) and isset($_REQUEST['tipo'])):
$tipo=$_REQUEST['tipo'];
$x_origen=$_REQUEST['x'];
$y_origen=$_REQUEST['y'];
	//echo "ok, se precedera a la busqueda. WAIT A MOMENT!";
switch ($tipo){
	case "escuela":
		$base = file_get_contents('data/escuelas.json', FILE_USE_INCLUDE_PATH);
		break;
	case "universidad":
		$base = file_get_contents('data/universidades.json', FILE_USE_INCLUDE_PATH);
		break;
	default:

		die('nada');
}



	$base_array=json_decode($base);
	$features_array=$base_array->features;
	foreach ( $features_array as $id => $feature ){
		$x=$feature->geometry->coordinates[0];
		$y=$feature->geometry->coordinates[1];
		$distancia=round( hypot(abs($x-$x_origen), abs($y-$y_origen)),5);
		$nombre=$feature->properties->universida;
		$resultado[]=array("id"=>$id,"tipo"=>$tipo,"nombre"=>$nombre,"x"=>$x,"y"=>$y,"dist"=>$distancia);
	}
//var_dump($resultado);   
	$resultado_ordenado=array_sort($resultado,"dist");
//	var_dump($resultado_ordenado);

	echo json_encode($resultado_ordenado);
else:
	echo "Faltan parametros, que se yo cuales, faltan";
endif;

?>
