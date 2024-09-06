package acorn.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import acorn.entity.Train;
import acorn.repository.TrainRepository;

@Service
public class TrainService {

    private final TrainRepository trainRepository;

    @Autowired
    public TrainService(TrainRepository trainRepository) {
        this.trainRepository = trainRepository;
    }
    
    // 모든 훈련 조회(일정에 추가)
    public List<Train> getAllTrains() {
        return trainRepository.findAll();
    }

    // 모든 훈련 조회 (페이징 처리)
    public Page<Train> getAllTrains(Pageable pageable) {
        return trainRepository.findAll(pageable);
    }

    // 특정 훈련 조회
    public Train getTrainById(int trainIdx) {
        Optional<Train> train = trainRepository.findById(trainIdx);
        return train.orElse(null);
    }

    // 새로운 훈련 추가
    public Train addTrain(Train train) {
        return trainRepository.save(train);
    }

    // 훈련 업데이트
    public Train updateTrain(int trainIdx, Train trainDetails) {
        Train train = getTrainById(trainIdx);
        if (train != null) {
            train.setTrainName(trainDetails.getTrainName());
            train.setStartDate(trainDetails.getStartDate());
            train.setEndDate(trainDetails.getEndDate());
            train.setStartTime(trainDetails.getStartTime());
            train.setEndTime(trainDetails.getEndTime());
            train.setArea(trainDetails.getArea());
            train.setMemo(trainDetails.getMemo());
            train.setCountMem(trainDetails.getCountMem());
            return trainRepository.save(train);
        }
        return null;
    }

    // 훈련 삭제
    public void deleteTrain(int trainIdx) {
        trainRepository.deleteById(trainIdx);
    }
}