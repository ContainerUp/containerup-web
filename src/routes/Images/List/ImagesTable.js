import {
    Alert,
    Paper,
    Snackbar,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow
} from "@mui/material";
import MyTableRowsLoader from "../../../components/MyTableRowsLoader";
import MyTableRowSingle from "../../../components/MyTableRowSingle";
import Link from "@mui/material/Link";
import {Link as RouterLink} from "react-router-dom";
import {useMemo, useState} from "react";
import sizeUtil from "../../../lib/sizeUtil";
import ImageActions from "./ImageActions";
import CreatedAt from "../../../components/CreatedAt";

export default function ImagesTable({loading, errMsg, imagesData}) {
    const imgd = useMemo(() => {
        const ret = [];

        for (const img of imagesData) {
            img.idShort = img.Id.substring(0, 12);
            img.sizeHuman = sizeUtil.humanReadableSize(img.Size);

            let hasTag = false;
            if (Array.isArray(img.Names)) {
                for (const repoTag of img.Names) {
                    const parts = repoTag.split(':');
                    let [repo, tag] = ['', ''];
                    if (parts.length === 2) {
                        [repo, tag] = parts;
                    } else {
                        [repo] = parts;
                        tag = '<none>';
                    }
                    ret.push({
                        ...img,
                        repo,
                        tag,
                        nameOrId: repoTag
                    });
                    hasTag = true;
                }
            }

            if (!hasTag) {
                ret.push({
                    ...img,
                    repo: '<none>',
                    tag: '<none>',
                    nameOrId: img.idShort
                })
            }
        }

        return ret;
    }, [imagesData]);

    const [showDeletedDialog, setShowDeletedDialog] = useState(false);
    const [deletedImg, setDeletedImg] = useState({name: '', action: ''});
    const [showTaggedDialog, setShowTaggedDialog] = useState(false);
    const [tagImageId, setTagImageId] = useState('');
    const [tagName, setTagName] = useState('');

    const handleDeletedDialogClose = () => {
        setShowDeletedDialog(false);
    };

    const handleTaggedDialogClose = () => {
        setShowTaggedDialog(false);
    };

    return (
        <>
            <TableContainer component={Paper}>
                <Table stickyHeader sx={{ minWidth: 650 }} aria-label="containers table">
                    <TableHead>
                        <TableRow>
                            <TableCell>Image ID</TableCell>
                            <TableCell>Repository</TableCell>
                            <TableCell>Tag</TableCell>
                            <TableCell>Created At</TableCell>
                            <TableCell>Containers</TableCell>
                            <TableCell>Size</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading && (
                            <MyTableRowsLoader rows={3} cols={7} sx={{height: '72px'}} />
                        )}

                        {!!errMsg && (
                            <MyTableRowSingle cols={7}>
                                <Alert severity="error">
                                    {errMsg}
                                </Alert>
                            </MyTableRowSingle>
                        )}

                        {!errMsg && !loading && !imagesData.length && (
                            <MyTableRowSingle cols={7}>
                                No image found. Pull one?
                            </MyTableRowSingle>
                        )}

                        {!errMsg && !loading && imgd.map(img => (
                            <TableRow key={img.repo + ':' + img.tag + '@' + img.Id}>
                                <TableCell>
                                    <Link component={RouterLink} to={img.idShort}>
                                        {img.idShort}
                                    </Link>
                                </TableCell>

                                <TableCell>
                                    {img.repo}
                                </TableCell>

                                <TableCell>
                                    {img.tag}
                                </TableCell>

                                <TableCell>
                                    <CreatedAt createdUnixTimestamp={img.Created} />
                                </TableCell>

                                <TableCell>
                                    {img.Containers}
                                </TableCell>

                                <TableCell>
                                    {img.sizeHuman[0]} {img.sizeHuman[1]}
                                </TableCell>

                                <TableCell>
                                    <ImageActions
                                        img={img}
                                        onDeleted={delAct => {
                                            setShowDeletedDialog(true);
                                            setDeletedImg({
                                                name: img.nameOrId,
                                                action: delAct
                                            });
                                        }}
                                        onTagged={t => {
                                            setShowTaggedDialog(true);
                                            setTagImageId(img.idShort);
                                            setTagName(t);
                                        }}
                                    />
                                </TableCell>
                            </TableRow>
                        ))}

                    </TableBody>
                </Table>
            </TableContainer>

            <Snackbar open={showDeletedDialog} autoHideDuration={5000} onClose={handleDeletedDialogClose}>
                <Alert severity="success" onClose={handleDeletedDialogClose}>
                    Image <b>{deletedImg.name}</b> {deletedImg.action}.
                </Alert>
            </Snackbar>

            <Snackbar open={showTaggedDialog} autoHideDuration={5000} onClose={handleTaggedDialogClose}>
                <Alert severity="success" onClose={handleTaggedDialogClose}>
                    Tag <b>{tagName}</b> added to <b>{tagImageId}</b>.
                </Alert>
            </Snackbar>
        </>
    );
}