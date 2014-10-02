<?php
ini_set('memory_limit','512M');
//ini_set('max_execution_time','1000');
header('Content-Type: application/json');
error_reporting(E_ALL);
include('cache.class.php');
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
} // End array_sort

function max_distance($result){
 if (! empty($result)){
 $max=0;
if (count($result)>9){
//echo count($result).' ';
  foreach($result as $id => $data){
		if ($max<$data['distancia']) {$max=$data['distancia']; $id_max=$id;}
	}
}
	else {$max= 1000000000; $id_max=null;}
  
 }else{
	$max= 1000000000;$id_max=null;
 }
	return ['id'=>$id_max,'valor'=>$max];

} // End max_distance


if (isset($_REQUEST['x']) and isset($_REQUEST['y']) and isset($_REQUEST['tipo'])):
$tipo=$_REQUEST['tipo'];
$x_origen=$_REQUEST['x'];
$y_origen=$_REQUEST['y'];
$cache= new Cache;
if ($cache->fileExists($x_origen,$y_origen,$tipo)) {
	echo $cache->getFile($x_origen,$y_origen,$tipo);}
else{

	//echo "ok, se precedera a la busqueda. WAIT A MOMENT!";
  switch ($tipo){
	case "escuela":
		$base = file_get_contents('data/escuelas.json', FILE_USE_INCLUDE_PATH);
		break;
	case "universidad":
		$base = file_get_contents('data/universidades.json', FILE_USE_INCLUDE_PATH);
		break;
	default:

		die('nada, solo se de escuelas y universidades`');
  } 

	$base_array=json_decode($base);
	unset($base);
	$features_array=$base_array->features;
	$resultado=array();
	$mayor_hasta_ahora['valor']=10000000000000;
	$mayor_hasta_ahora['id']=null;
	foreach ( $features_array as $id => $feature ){
		$x=$feature->geometry->coordinates[0];
		$y=$feature->geometry->coordinates[1];
		$distancia=round( hypot(abs($x-$x_origen), abs($y-$y_origen)),5);

		if ($tipo=='universidad'){
		$nombre=$feature->properties->universida;
		}else{$nombre=$feature->properties->nom_est;}


		if ($distancia<$mayor_hasta_ahora['valor']){
			unset($resultado[$mayor_hasta_ahora['id']]);
			$resultado[]=array("id"=>$id,"tipo"=>$tipo,"nombre"=>$nombre,"x"=>$x,"y"=>$y,"distancia"=>$distancia);
		}
		$mayor_hasta_ahora=max_distance($resultado);
	}
	$resultado_ordenado=array_sort($resultado,"distancia");
	unset($resultado);
	$json_result=json_encode($resultado_ordenado);
// Salvar en cache
	$cache->putFile($x_origen,$y_origen,$tipo,$json_result);
	echo $json_result;

}

  else:
	echo "Faltan parametros, que se yo cuales, faltan";
  endif;

?>
