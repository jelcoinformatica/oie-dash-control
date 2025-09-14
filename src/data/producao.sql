  SELECT DISTINCT
      id            = a.venda_id
    , mesa_id       = a.codigo_ticket
    , mesa          = a.ticket
    , numpedido     = iif(isnull( c.nome, '') = '', convert( varchar, a.numero_venda ), c.nome )
    , situacao      = a.codigo_situacao
    , dt_ultimacons = a.dt_hr_ultimo_consumo
    , a.dt_contabil
    , a.modo_venda_id	
    , i.local_entrega

    --, NM_GARCOM    = (F.NOME)
      FROM venda  A
      LEFT JOIN  JELCO.JL_CONTROLE_PEDIDOS8	P ON ( A.VENDA_ID   = P.VENDA_ID )
      LEFT JOIN  TICKET	                    T ON ( A.VENDA_ID   = T.VENDA_ID )
      INNER JOIN VENDA_ITEM                 I ON ( A.VENDA_ID = I.VENDA_ID )
      INNER JOIN LOCAL_PRODUCAO             L ON ( I.LOCAL_PRODUCAO_ID = L.ID )
      LEFT  JOIN CLIENTE                    C ON C.ID = A.CLIENTE_ID
      WHERE ( A.codigo_situacao  = 'N' )
 		    AND ( A.modo_venda_id IN ( 1,2,3,4 )  )
		    --AND ( P.HR_FASE03 IS NULL ) --***
		    AND ( A.dt_hr_ultimo_consumo >= ( SELECT TOP 1 dt_hr_ultimo_consumo -2 FROM VENDA ORDER BY 1 DESC ) )
			AND NOT A.VENDA_ID IN ( SELECT VENDA_ID FROM JELCO.PEDIDO_PRONTO WHERE DT_CONTABIL = A.DT_CONTABIL )
      AND NOT A.VENDA_ID IN ( SELECT VENDA_ID FROM JELCO.JL_CONTROLE_PEDIDOS8 WHERE NOT HR_FASE03 IS NULL)
      -- AND ( L.NOME = 'LOCAL_PRODUCAO' )