import {TableCell, TableRow, Skeleton} from "@mui/material";

export default function MyTableRowsLoader({cols, rows}) {
    return (
        <>
            {[...Array(rows)].map((row, index) => (
                <TableRow key={index}>
                    {[...Array(cols)].map((col, j) => (
                        <TableCell key={j}>
                            <Skeleton animation="wave" variant="text" />
                        </TableCell>
                    ))}
                </TableRow>
            ))}
        </>
    );
}