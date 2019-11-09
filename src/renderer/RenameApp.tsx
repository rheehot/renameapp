import { ipcRenderer, IpcRendererEvent } from 'electron';
import React, {
    FunctionComponent,
    useState,
    useEffect,
    useCallback,
} from 'react';
import { FileInput } from './FileInput';
import { List } from './List.jsx';
import { FileInfo } from '../FileInfo';
import MenuIcon from '@material-ui/icons/Menu';
import { types } from '../typings/replaceType';
import {
    AppBar,
    Toolbar,
    IconButton,
    makeStyles,
    Theme,
    createStyles,
    Paper,
    Button,
    Select,
    MenuItem,
    InputLabel,
    FormControl,
    Typography,
    Container,
    CssBaseline,
    TextField,
} from '@material-ui/core';
import { withSnackbar, WithSnackbarProps } from 'notistack';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            flexGrow: 1,
        },
        menuButton: {
            marginRight: theme.spacing(2),
        },
        title: {
            flexGrow: 1,
        },
        formControl: {
            margin: theme.spacing(1),
            minWidth: 120,
        },
        selectEmpty: {
            marginTop: theme.spacing(2),
        },
        formContainer: {
            display: 'flex',
            flexWrap: 'wrap',
        },
        textField: {
            marginLeft: theme.spacing(1),
            marginRight: theme.spacing(1),
            width: 200,
        },
    })
);

export interface IRenameAppProps extends WithSnackbarProps {}

const RenameAppInternal: FunctionComponent<IRenameAppProps> = ({
    enqueueSnackbar,
}) => {
    const classes = useStyles();

    const [files, setFiles] = useState<FileInfo[]>([]);
    const [renamedFiles, setRenamedFiles] = useState<FileInfo[]>([]);
    const [type, setType] = useState('1');
    const [append, setAppend] = useState('');
    const [lookup, setLookup] = useState('');
    const [replace, setReplace] = useState('');
    const [lookupRegExp, setLookupRegExp] = useState('');
    const [replaceRegExp, setReplaceRegExp] = useState('');
    const [enablePreviewButton, setEnablePreviewButton] = useState(false);
    const [enabledRenameButton, setEnabledRenameButton] = useState(false);

    useEffect(() => {
        const getSelectedFiles = (ev: IpcRendererEvent, args: FileInfo[]) => {
            setFiles(args);
            setRenamedFiles([]);
        };

        const renameFilesCallback = (
            ev: IpcRendererEvent,
            args: FileInfo[]
        ) => {
            // let renamedResults = args.map((v, i) => {
            //     return {
            //         name: v.name,
            //         extension: v.extension,
            //         directoryName: v.directoryName,
            //         fullPath: v.fullPath,
            //         error: v.error,
            //         hasError: v.hasError,
            //         renamed: v.renamed,
            //     };
            // });

            setFiles(args);
            setRenamedFiles([]);
            setAppend('');
            setLookup('');
            setReplace('');
            setLookupRegExp('');
            setReplaceRegExp('');
            setEnablePreviewButton(false);
            setEnabledRenameButton(false);

            // alert.show('Renamed!');
            enqueueSnackbar('Renamed!');
        };

        ipcRenderer.on('renameFiles-callback', renameFilesCallback);

        ipcRenderer.on('get-selected-file', getSelectedFiles);

        return () => {
            ipcRenderer.off('get-selected-file', getSelectedFiles);
            ipcRenderer.off('renameFiles-callback', renameFilesCallback);
        };
    }, []);

    const onTypeChanged = useCallback(
        event => {
            let selectedValue = event.target.value;
            if (type !== selectedValue) {
                setType(selectedValue);
                setAppend('');
                setLookup('');
                setReplace('');
                setLookupRegExp('');
                setReplaceRegExp('');
                setEnablePreviewButton(false);
                setEnabledRenameButton(false);
            }

            validateCanPreview();
        },
        [type]
    );

    const onAppendChanged = useCallback(event => {
        let changedValue = event.target.value;
        if (append !== changedValue) {
            setAppend(changedValue);
        }
        validateCanPreview();
    }, []);

    const onLookupChanged = useCallback(
        event => {
            let changedValue = event.target.value;
            if (changedValue !== lookup) {
                // this.setState({ lookup: changedValue });
                setLookup(changedValue);
            }

            validateCanPreview();
        },
        [lookup]
    );

    const onReplaceChanged = useCallback(
        event => {
            let changedValue = event.target.value;
            if (replace !== changedValue) {
                setReplace(changedValue);
            }
        },
        [replace]
    );

    const onLookupRegExpChanged = useCallback(
        event => {
            // const { lookupRegExp } = this.state;
            let changedValue = event.target.value;
            if (lookupRegExp !== changedValue) {
                // this.setState({ lookupRegExp: changedValue });
                setLookupRegExp(changedValue);
            }

            validateCanPreview();
        },
        [lookupRegExp]
    );

    const onReplaceRegExpChanged = useCallback(
        event => {
            // const { replaceRegExp } = this.state;
            let changedValue = event.target.value;
            if (replaceRegExp !== changedValue) {
                // this.setState({ replaceRegExp: changedValue });
                setReplaceRegExp(changedValue);
            }
        },
        [replaceRegExp]
    );

    const onPreviewClick = useCallback(event => {
        applyRename();

        // this.setState({ enabledRenameButton: true });
        setEnabledRenameButton(true);
    }, []);

    const onRenameClick = useCallback(
        event => {
            // const { renamedFiles } = this.state;
            if (renamedFiles) {
                ipcRenderer.send('rename-files', renamedFiles);
                setEnabledRenameButton(false);
            }
        },
        [renamedFiles]
    );

    const applyRename = useCallback(() => {
        // const { files, type, append, lookup, replace, lookupRegExp, replaceRegExp } = this.state;

        const candidateFiles = files.map((v, i) => {
            let name = '';
            // let obj = {
            //     name: v.name,
            //     extension: v.extension,
            //     directoryName: v.directoryName,
            //     fullPath: v.fullPath,
            //     error: null,
            //     hasError: false,
            //     renamed: false,
            // };

            if (type === '1') {
                // console.log('name: ', obj.name, obj.name);
                // console.log('lookup: ', lookup);
                // console.log('replace: ', replace);

                // obj.name = obj.name.replace(lookup, replace);
                name = v.name.replace(lookup, replace);
            }
            if (type === '2') {
                // obj.name = `${append}${obj.name}`;
                name = `${append}${v.name}`;
            }
            if (type === '3') {
                // obj.name = `${obj.name}${append}`;
                name = `${v.name}${append}`;
            }
            if (type === '4') {
                // 정규식
                const regExp = new RegExp(lookupRegExp, 'gi');
                // obj.name = obj.name.replace(regExp, replaceRegExp);
                name = v.name.replace(regExp, replaceRegExp);
            }

            // return obj;
            return new FileInfo({
                name: name,
                error: null,
                renamed: false,
                ...v,
            });
        });

        console.log('renamed files: ', candidateFiles);

        // this.setState({ renamedFiles: renamedFiles });
        setRenamedFiles(candidateFiles);
    }, [files, type, append, lookup, replace, lookupRegExp, replaceRegExp]);

    const validateCanPreview = useCallback(() => {
        var valid = updatePreviewButtonStatus();
        if (enablePreviewButton !== valid) {
            setEnablePreviewButton(valid);
        }
    }, [enablePreviewButton]);

    const updatePreviewButtonStatus = useCallback(() => {
        if (files == null || files.length < 1) {
            return false;
        }

        if (type === '1') {
            if (lookup && lookup.length > 0) {
                return true;
            }
        }

        if (type === '2') {
            if (append && append.length > 0) {
                return true;
            }
        }

        if (type === '3') {
            if (append && append.length > 0) {
                return true;
            }
        }

        if (type === '4') {
            if (lookupRegExp && lookupRegExp.length > 0) {
                return true;
            }
        }

        return false;
    }, [files, type, append, lookup, lookupRegExp]);

    return (
        <>
            <CssBaseline />
            <Container maxWidth="sm">
                <AppBar position="static">
                    <Toolbar>
                        <IconButton
                            edge="start"
                            className={classes.menuButton}
                            color="inherit"
                            arai-label="menu"
                        >
                            <MenuIcon />
                        </IconButton>
                        <Typography variant="h6" className={classes.title}>
                            Reanme
                        </Typography>
                    </Toolbar>
                </AppBar>
                <Paper>
                    <FileInput />
                </Paper>

                <Paper>
                    <form
                        className={classes.formContainer}
                        noValidate
                        autoComplete="off"
                    >
                        <FormControl className={classes.formControl}>
                            <InputLabel id="selectOperationType">
                                Type
                            </InputLabel>
                            <Select
                                labelId="selectOperationType"
                                id="demo-simple-select"
                                value={type}
                                onChange={onTypeChanged}
                            >
                                {types.map((v, i) => {
                                    return (
                                        <MenuItem key={v.key} value={v.key}>
                                            {v.value}
                                        </MenuItem>
                                    );
                                })}
                            </Select>
                        </FormControl>
                        <div>
                            {type === '2' || type === '3' ? (
                                <div>
                                    <TextField
                                        value={append}
                                        onChange={onAppendChanged}
                                        label="추가할 문자열"
                                        margin="normal"
                                        className={classes.textField}
                                    />
                                </div>
                            ) : null}

                            {type === '1' ? (
                                <div>
                                    <div>
                                        <TextField
                                            label="찾는 문자열"
                                            value={lookup}
                                            onChange={onLookupChanged}
                                            className={classes.textField}
                                            placeholder="찾는 문자열"
                                        />
                                    </div>

                                    <div>
                                        <TextField
                                            label="변경할 문자열"
                                            value={replace}
                                            onChange={onReplaceChanged}
                                            className={classes.textField}
                                            placeholder="변경할 문자열"
                                        />
                                        <small className="form-text text-muted">
                                            첫번째 발견된 문자열만 변경됩니다.
                                        </small>
                                    </div>
                                </div>
                            ) : null}
                        </div>
                    </form>
                </Paper>
                <div>
                    <div className="row">
                        <div className="col-9">
                            {type === '4' ? (
                                <div className="row">
                                    <div className="col-6">
                                        <div className="form-group">
                                            <label className="control-label">
                                                찾는 정규식
                                            </label>
                                            <div className="input-group input-group-sm">
                                                <div className="input-group-prepend">
                                                    <span className="input-group-text">
                                                        /
                                                    </span>
                                                </div>
                                                <input
                                                    value={lookupRegExp}
                                                    onChange={
                                                        onLookupRegExpChanged
                                                    }
                                                    type="text"
                                                    className="form-control form-control-sm"
                                                    placeholder="정규식"
                                                />
                                                <div className="input-group-append">
                                                    <span className="input-group-text">
                                                        /gi
                                                    </span>
                                                </div>
                                            </div>
                                            <small className="form-text text-muted">
                                                발견된 모든 문자열이 변경됩니다.
                                            </small>
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <div className="form-group">
                                            <label className="control-label">
                                                변경할 문자열
                                            </label>
                                            <input
                                                value={replaceRegExp}
                                                onChange={
                                                    onReplaceRegExpChanged
                                                }
                                                type="text"
                                                className="form-control form-control-sm"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ) : null}
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-3">
                            <div
                                className="btn-group"
                                role="group"
                                aria-label="buttons"
                            >
                                <button
                                    type="button"
                                    className="btn btn-warning btn-sm align-bottom"
                                    disabled={!enablePreviewButton}
                                    onClick={onPreviewClick}
                                >
                                    Preview
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-primary btn-sm align-bottom"
                                    disabled={!enabledRenameButton}
                                    onClick={onRenameClick}
                                >
                                    Rename
                                </button>
                            </div>
                        </div>
                    </div>
                    <hr />
                    <div className="row">
                        <div className="col-6">
                            <h3>Before</h3>
                            <List files={files} />
                        </div>
                        <div className="col-6">
                            <h3>After</h3>
                            <List files={renamedFiles} />
                        </div>
                    </div>
                </div>
            </Container>
        </>
    );
};

export const RenameApp = withSnackbar(RenameAppInternal);
