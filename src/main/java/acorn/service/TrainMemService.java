package acorn.service;

import java.util.List;

import org.springframework.stereotype.Service;

import acorn.entity.Person;
import acorn.entity.Train;
import acorn.entity.TrainMem;
import acorn.repository.TrainMemRepository;

@Service
public class TrainMemService {

    private final TrainMemRepository trainMemRepository;

    public TrainMemService(TrainMemRepository trainMemRepository) {
        this.trainMemRepository = trainMemRepository;
    }

    public TrainMem addTrainMem(Train train, Person person) {
        TrainMem trainMem = TrainMem.builder()
                .train(train)
                .person(person)
                .build();
        return trainMemRepository.save(trainMem);
    }
    
    // 특정 훈련에서 특정 선수를 제거하는 메소드
    public void removeTrainMem(Train train, Person person) {
        TrainMem trainMem = trainMemRepository.findByTrainAndPerson(train, person);
        if (trainMem != null) {
            trainMemRepository.delete(trainMem);
        }
    }

    public List<TrainMem> getTrainMemsByTrain(Train train) {
        return trainMemRepository.findByTrain(train);
    }
}
